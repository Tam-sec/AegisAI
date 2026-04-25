from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from core.database import get_db
from core.auth import (
    get_current_user,
    require_role,
    get_password_hash,
    create_access_token,
    verify_password,
)
from core.encryption import encrypt_data, decrypt_data
from models.models import (
    User,
    Candidate,
    CandidateFile,
    Job,
    CandidateScore,
    PolicyDocument,
    ChatbotSession,
    ChatbotMessage,
    AuditLog,
    DeletionRequest,
    AppSetting,
)
from services.ollama_service import ollama_service
from services.cv_parser_service import cv_parser_service
from services.rag_service import RAGService
from services.file_service import FileService
from services.audit_service import AuditService

router = APIRouter()

# ─── Auth Routes ───


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
    }


# ─── Health Check ───


@router.get("/health")
async def health_check():
    ollama_status = await ollama_service.health_check()
    return {
        "status": "healthy",
        "ollama": ollama_status,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─── Candidates ───


class CandidateCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


@router.post("/candidates")
async def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cand = Candidate(**candidate.dict())
    db.add(cand)
    db.commit()
    db.refresh(cand)

    audit = AuditService(db)
    audit.log_event("candidate_created", user_id=current_user.id, candidate_id=cand.id)

    return cand


@router.post("/candidates/{candidate_id}/upload")
async def upload_cv(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    file_service = FileService()
    if not file_service.validate_file(file):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = await file_service.save_file(file, candidate_id)

    cand_file = CandidateFile(
        candidate_id=candidate_id,
        filename=file.filename,
        file_path=file_path,
        file_type="pdf",
        file_size=file_service.get_file_size(file_path),
    )
    db.add(cand_file)
    db.commit()

    # Parse CV
    parsed = await cv_parser_service.parse_cv(file_path)
    candidate.encrypted_resume_text = encrypt_data(parsed["raw_text"])
    candidate.extracted_data = parsed["extracted_data"]

    # Update candidate info from extraction
    extracted = parsed["extracted_data"]
    if extracted:
        candidate.first_name = extracted.get("first_name") or candidate.first_name
        candidate.last_name = extracted.get("last_name") or candidate.last_name
        candidate.email = extracted.get("email") or candidate.email
        candidate.location = extracted.get("location") or candidate.location

    candidate.status = "screened"
    db.commit()

    audit = AuditService(db)
    audit.log_event(
        "cv_uploaded",
        user_id=current_user.id,
        candidate_id=candidate_id,
        details={"filename": file.filename},
    )
    audit.log_event(
        "cv_parsed",
        user_id=current_user.id,
        candidate_id=candidate_id,
        model_name=ollama_service.model,
    )

    return {"message": "CV uploaded and parsed", "candidate_id": candidate_id}


@router.get("/candidates")
async def list_candidates(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Candidate)
    if status:
        query = query.filter(Candidate.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    result = {
        "id": candidate.id,
        "first_name": candidate.first_name,
        "last_name": candidate.last_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "location": candidate.location,
        "status": candidate.status,
        "extracted_data": candidate.extracted_data,
        "created_at": candidate.created_at,
        "files": [{"id": f.id, "filename": f.filename} for f in candidate.files],
        "scores": [
            {
                "id": s.id,
                "job_id": s.job_id,
                "match_score": s.match_score,
                "recruiter_decision": s.recruiter_decision,
            }
            for s in candidate.scores
        ],
    }
    return result


# ─── Jobs ───


class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience_years: Optional[int] = None
    department: Optional[str] = None
    location: Optional[str] = None


@router.post("/jobs")
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    j = Job(**job.dict())
    db.add(j)
    db.commit()
    db.refresh(j)
    return j


@router.get("/jobs")
async def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()


# ─── Scoring ───


@router.post("/candidates/{candidate_id}/score/{job_id}")
async def score_candidate(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if not candidate or not job:
        raise HTTPException(status_code=404, detail="Candidate or job not found")

    extracted_data = candidate.extracted_data or {}

    score_result = await cv_parser_service.score_candidate(extracted_data, job)

    score = CandidateScore(
        candidate_id=candidate_id,
        job_id=job_id,
        match_score=score_result.get("match_score", 0),
        rule_score=score_result.get("rule_score", 0),
        ai_explanation=score_result.get("explanation", ""),
        missing_skills=score_result.get("missing_skills", []),
        matching_skills=score_result.get("matching_skills", []),
        recruiter_decision="pending",
        scored_by=current_user.username,
    )
    db.add(score)
    db.commit()
    db.refresh(score)

    audit = AuditService(db)
    audit.log_event(
        "candidate_scored",
        user_id=current_user.id,
        candidate_id=candidate_id,
        details={"job_id": job_id, "score": score.match_score},
        model_name=ollama_service.model,
        explanation=score.ai_explanation,
    )

    return score


class RecruiterDecision(BaseModel):
    decision: str  # approved, rejected, review_requested
    notes: Optional[str] = None


@router.post("/scores/{score_id}/decision")
async def make_decision(
    score_id: int,
    decision: RecruiterDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    score = db.query(CandidateScore).filter(CandidateScore.id == score_id).first()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")

    score.recruiter_decision = decision.decision
    score.recruiter_notes = decision.notes
    db.commit()

    # Update candidate status
    candidate = db.query(Candidate).filter(Candidate.id == score.candidate_id).first()
    if decision.decision == "approved":
        candidate.status = "shortlisted"
    elif decision.decision == "rejected":
        candidate.status = "rejected"

    db.commit()

    audit = AuditService(db)
    audit.log_event(
        "recruiter_decision",
        user_id=current_user.id,
        candidate_id=score.candidate_id,
        details={"score_id": score_id, "decision": decision.decision},
        human_decision=decision.decision,
        explanation=decision.notes,
    )

    return {"message": "Decision recorded", "decision": decision.decision}


# ─── Policy Documents & Chatbot ───


@router.post("/policies/upload")
async def upload_policy(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    file_service = FileService()
    file_path = await file_service.save_file(file, 0)  # 0 for policies

    doc = PolicyDocument(
        title=title, description=description, file_path=file_path, file_type="pdf"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extract text and chunk
    text = cv_parser_service.extract_text_from_pdf(file_path)
    chunks = [text[i : i + 1000] for i in range(0, len(text), 1000)]

    rag = RAGService(db)
    await rag.ingest_document(doc, chunks)

    audit = AuditService(db)
    audit.log_event(
        "policy_uploaded", user_id=current_user.id, details={"title": title}
    )

    return {"message": "Policy uploaded", "document_id": doc.id}


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    question: str


@router.post("/chatbot/ask")
async def ask_chatbot(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rag = RAGService(db)
    result = await rag.answer_question(req.question)

    # Get or create session
    session = None
    if req.session_id:
        session = (
            db.query(ChatbotSession)
            .filter(ChatbotSession.session_id == req.session_id)
            .first()
        )

    if not session:
        import uuid

        session = ChatbotSession(
            session_id=str(uuid.uuid4()),
            user_id=current_user.id,
            title=req.question[:50],
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save messages
    user_msg = ChatbotMessage(session_id=session.id, role="user", content=req.question)
    db.add(user_msg)

    assistant_msg = ChatbotMessage(
        session_id=session.id,
        role="assistant",
        content=result["answer"],
        sources=result["sources"],
        model_used=ollama_service.model,
    )
    db.add(assistant_msg)
    db.commit()

    audit = AuditService(db)
    audit.log_event(
        "chatbot_answer",
        user_id=current_user.id,
        details={"question": req.question, "confidence": result["confidence"]},
        model_name=ollama_service.model,
        explanation=result["answer"],
    )

    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "confidence": result["confidence"],
        "session_id": session.session_id,
    }


# ─── Analytics ───


@router.get("/analytics/dashboard")
async def get_analytics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    total_cvs = db.query(Candidate).count()
    screened_today = (
        db.query(Candidate)
        .filter(
            Candidate.created_at
            >= datetime.utcnow().replace(hour=0, minute=0, second=0)
        )
        .count()
    )
    avg_score = (
        db.query(CandidateScore).filter(CandidateScore.match_score != None).all()
    )
    avg = sum(s.match_score for s in avg_score) / len(avg_score) if avg_score else 0

    pending_decisions = (
        db.query(CandidateScore)
        .filter(CandidateScore.recruiter_decision == "pending")
        .count()
    )
    approved = (
        db.query(CandidateScore)
        .filter(CandidateScore.recruiter_decision == "approved")
        .count()
    )
    rejected = (
        db.query(CandidateScore)
        .filter(CandidateScore.recruiter_decision == "rejected")
        .count()
    )

    chat_count = db.query(ChatbotMessage).filter(ChatbotMessage.role == "user").count()

    return {
        "total_cvs": total_cvs,
        "screened_today": screened_today,
        "average_score": round(avg, 2),
        "pending_decisions": pending_decisions,
        "approved_count": approved,
        "rejected_count": rejected,
        "chatbot_usage": chat_count,
        "model_in_use": ollama_service.model,
    }


# ─── Audit Logs ───


@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    audit = AuditService(db)
    logs = audit.get_logs(skip=skip, limit=limit, event_type=event_type)
    return logs


# ─── Deletion Requests ───


class DeletionRequestPayload(BaseModel):
    reason: str


@router.post("/candidates/{candidate_id}/request-deletion")
async def request_deletion(
    candidate_id: int,
    payload: DeletionRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = DeletionRequest(
        candidate_id=candidate_id, requested_by=current_user.id, reason=payload.reason
    )
    db.add(req)
    db.commit()

    audit = AuditService(db)
    audit.log_event(
        "deletion_requested",
        user_id=current_user.id,
        candidate_id=candidate_id,
        details={"reason": payload.reason},
    )

    return {"message": "Deletion request submitted", "request_id": req.id}


@router.post("/deletion-requests/{request_id}/confirm")
async def confirm_deletion(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    req = db.query(DeletionRequest).filter(DeletionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    candidate = db.query(Candidate).filter(Candidate.id == req.candidate_id).first()
    if candidate:
        # Delete files
        file_service = FileService()
        file_service.delete_candidate_files(candidate.id)

        # Delete from database
        db.delete(candidate)

    req.status = "completed"
    req.completed_at = datetime.utcnow()
    db.commit()

    audit = AuditService(db)
    audit.log_event(
        "data_deleted", user_id=current_user.id, details={"request_id": request_id}
    )

    return {"message": "Candidate data deleted"}


# ─── Fairness Check ───


@router.post("/jobs/{job_id}/fairness-check")
async def run_fairness_check(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    scores = db.query(CandidateScore).filter(CandidateScore.job_id == job_id).all()
    total = len(scores)
    shortlisted = len([s for s in scores if s.recruiter_decision == "approved"])

    selection_rate = (shortlisted / total * 100) if total > 0 else 0

    # Simple adverse impact check
    # In production, this would analyze by demographic groups
    flagged = False
    if total > 0 and selection_rate < 20:
        flagged = True

    result = {
        "job_id": job_id,
        "total_candidates": total,
        "shortlisted_count": shortlisted,
        "selection_rate": round(selection_rate, 2),
        "flagged_for_review": flagged,
        "warning": "Low selection rate detected. Review for potential bias."
        if flagged
        else None,
        "disclaimer": "This is a monitoring tool, not legal advice. Protected characteristics are not used in ranking.",
    }

    audit = AuditService(db)
    audit.log_event("bias_check_run", user_id=current_user.id, details=result)

    return result

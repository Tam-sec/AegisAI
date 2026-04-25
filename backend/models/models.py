from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Float,
    JSON,
    LargeBinary,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="recruiter")  # admin, recruiter, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    location = Column(String)
    encrypted_resume_text = Column(Text)
    extracted_data = Column(JSON)
    status = Column(
        String, default="new"
    )  # new, screened, shortlisted, rejected, hired
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    files = relationship(
        "CandidateFile", back_populates="candidate", cascade="all, delete-orphan"
    )
    scores = relationship(
        "CandidateScore", back_populates="candidate", cascade="all, delete-orphan"
    )
    audit_logs = relationship("AuditLog", back_populates="candidate")


class CandidateFile(Base):
    __tablename__ = "candidate_files"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    candidate = relationship("Candidate", back_populates="files")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    required_skills = Column(JSON)
    preferred_skills = Column(JSON)
    min_experience_years = Column(Integer)
    department = Column(String)
    location = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CandidateScore(Base):
    __tablename__ = "candidate_scores"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    match_score = Column(Float)
    rule_score = Column(Float)
    ai_explanation = Column(Text)
    missing_skills = Column(JSON)
    matching_skills = Column(JSON)
    recruiter_notes = Column(Text)
    recruiter_decision = Column(String)  # pending, approved, rejected, review_requested
    scored_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    candidate = relationship("Candidate", back_populates="scores")
    job = relationship("Job")


class FairnessCheck(Base):
    __tablename__ = "fairness_checks"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    total_candidates = Column(Integer)
    shortlisted_count = Column(Integer)
    selection_rate = Column(Float)
    adverse_impact_ratio = Column(Float)
    flagged_groups = Column(JSON)
    analysis_summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PolicyDocument(Base):
    __tablename__ = "policy_documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String)
    file_type = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    chunks = relationship(
        "PolicyChunk", back_populates="document", cascade="all, delete-orphan"
    )


class PolicyChunk(Base):
    __tablename__ = "policy_chunks"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("policy_documents.id", ondelete="CASCADE"))
    chunk_text = Column(Text)
    embedding = Column(LargeBinary)  # Store vector as bytes
    chunk_index = Column(Integer)
    section_title = Column(String)
    document = relationship("PolicyDocument", back_populates="chunks")


class ChatbotSession(Base):
    __tablename__ = "chatbot_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    messages = relationship(
        "ChatbotMessage", back_populates="session", cascade="all, delete-orphan"
    )


class ChatbotMessage(Base):
    __tablename__ = "chatbot_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chatbot_sessions.id", ondelete="CASCADE"))
    role = Column(String)  # user, assistant
    content = Column(Text)
    sources = Column(JSON)
    model_used = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("ChatbotSession", back_populates="messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(
        String, nullable=False
    )  # cv_uploaded, cv_parsed, candidate_scored, bias_check_run, recruiter_decision, chatbot_answer, data_deleted
    user_id = Column(Integer, ForeignKey("users.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    details = Column(JSON)
    model_name = Column(String)
    model_version = Column(String)
    prompt_version = Column(String)
    explanation = Column(Text)
    human_decision = Column(String)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    candidate = relationship("Candidate", back_populates="audit_logs")


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    requested_by = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text)
    status = Column(String, default="pending")  # pending, approved, completed, rejected
    confirmed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AppSetting(Base):
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

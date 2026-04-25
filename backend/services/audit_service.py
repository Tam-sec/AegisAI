import json
from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from models.models import AuditLog
from core.encryption import mask_pii


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log_event(
        self,
        event_type: str,
        user_id: Optional[int] = None,
        candidate_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        model_name: Optional[str] = None,
        model_version: Optional[str] = None,
        prompt_version: Optional[str] = None,
        explanation: Optional[str] = None,
        human_decision: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        # Mask PII in details and explanation before logging
        safe_details = {}
        if details:
            safe_details = json.loads(mask_pii(json.dumps(details)))

        safe_explanation = mask_pii(explanation) if explanation else None

        log = AuditLog(
            event_type=event_type,
            user_id=user_id,
            candidate_id=candidate_id,
            details=safe_details,
            model_name=model_name,
            model_version=model_version,
            prompt_version=prompt_version,
            explanation=safe_explanation,
            human_decision=human_decision,
            ip_address=ip_address,
            created_at=datetime.utcnow(),
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_logs(
        self,
        skip: int = 0,
        limit: int = 100,
        event_type: Optional[str] = None,
        candidate_id: Optional[int] = None,
    ):
        query = self.db.query(AuditLog)
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if candidate_id:
            query = query.filter(AuditLog.candidate_id == candidate_id)
        return (
            query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
        )

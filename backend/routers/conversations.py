# routers/conversations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from typing import List
from datetime import datetime
import json

from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/conversations", tags=["conversations"])


# ─── Schemas ───────────────────────────────────────────────────────────────────

class MessageSchema(BaseModel):
    id: str
    text: str
    sender: str
    timestamp: str

class ConversationSave(BaseModel):
    id: str
    title: str
    language: str = "en"
    messages: List[MessageSchema]

class ConversationSummary(BaseModel):
    id: str
    title: str
    language: str
    created_at: str
    updated_at: str

class ConversationFull(ConversationSummary):
    messages: List[MessageSchema]


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ConversationSummary])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = (
        db.query(models.Conversation)
        .filter(models.Conversation.user_id == current_user.id)
        .order_by(models.Conversation.updated_at.desc())
        .all()
    )
    return [
        ConversationSummary(
            id=r.id,
            title=r.title,
            language=r.language,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
        )
        for r in rows
    ]


@router.get("/{conv_id}", response_model=ConversationFull)
def get_conversation(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationFull(
        id=row.id,
        title=row.title,
        language=row.language,
        messages=json.loads(row.messages),
        created_at=row.created_at.isoformat(),
        updated_at=row.updated_at.isoformat(),
    )


@router.put("/{conv_id}", response_model=ConversationSummary)
def save_conversation(
    conv_id: str,
    payload: ConversationSave,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """True upsert — handles the race condition where two saves fire at once."""
    now = datetime.utcnow()
    messages_json = json.dumps([m.dict() for m in payload.messages])

    # Try update first (most common path)
    row = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id,
    ).first()

    if row:
        row.title = payload.title
        row.language = payload.language
        row.messages = messages_json
        row.updated_at = now
        db.commit()
        db.refresh(row)
    else:
        row = models.Conversation(
            id=conv_id,
            user_id=current_user.id,
            title=payload.title,
            language=payload.language,
            messages=messages_json,
            created_at=now,
            updated_at=now,
        )
        db.add(row)
        try:
            db.commit()
            db.refresh(row)
        except IntegrityError:
            # Another request inserted it between our check and insert — just update it
            db.rollback()
            row = db.query(models.Conversation).filter(
                models.Conversation.id == conv_id,
                models.Conversation.user_id == current_user.id,
            ).first()
            if row:
                row.title = payload.title
                row.language = payload.language
                row.messages = messages_json
                row.updated_at = now
                db.commit()
                db.refresh(row)

    return ConversationSummary(
        id=row.id,
        title=row.title,
        language=row.language,
        created_at=row.created_at.isoformat(),
        updated_at=row.updated_at.isoformat(),
    )


@router.delete("/{conv_id}")
def delete_conversation(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = db.query(models.Conversation).filter(
        models.Conversation.id == conv_id,
        models.Conversation.user_id == current_user.id,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(row)
    db.commit()
    return {"deleted": conv_id}
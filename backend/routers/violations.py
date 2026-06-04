from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas
import json, os

router = APIRouter(prefix="/violations", tags=["Violations"])

# Load your rules.json once at startup
RULES_PATH = os.path.join(os.path.dirname(__file__), "..", "rules.json")
with open(RULES_PATH) as f:
    RULES: list = json.load(f)["violations"]

def find_rule(violation_id: str):
    return next((r for r in RULES if r["id"] == violation_id), None)


@router.post("/", response_model=schemas.ViolationResponse)
def add_violation(
    body: schemas.ViolationAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rule = find_rule(body.violation_id)
    if not rule:
        raise HTTPException(status_code=404, detail=f"Violation '{body.violation_id}' not found in rules")

    v = models.Violation(
        user_id=current_user.id,
        violation_id=rule["id"],
        name=rule["name"],
        section=rule["section"],
        points=rule["points"],
        fine=rule["fine"],
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.get("/", response_model=List[schemas.ViolationResponse])
def get_my_violations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Violation).filter(models.Violation.user_id == current_user.id).all()


@router.delete("/")
def clear_my_violations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Violation).filter(models.Violation.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Violations cleared"}

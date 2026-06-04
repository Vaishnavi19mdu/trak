from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/risk", tags=["Risk"])


def compute_score(violations: list[models.Violation]) -> int:
    """
    Same logic as your frontend computeRiskScore.
    Start at 100, subtract points per violation, floor at 0.
    """
    total_points = sum(v.points for v in violations)
    score = max(0, 100 - total_points)
    return score


def get_label(score: int) -> tuple[str, str]:
    if score >= 80:
        return "High Risk", "#ef4444"
    elif score >= 50:
        return "Moderate Risk", "#f97316"
    else:
        return "Low Risk", "#22c55e"


@router.get("/score", response_model=schemas.RiskScoreResponse)
def get_risk_score(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    violations = db.query(models.Violation).filter(models.Violation.user_id == current_user.id).all()

    score = compute_score(violations)
    label, color = get_label(score)

    return {
        "score": score,
        "label": label,
        "color": color,
        "total_violations": len(violations),
        "total_points_lost": 100 - score,
        "total_fines": sum(v.fine for v in violations),
    }

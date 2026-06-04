from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User Profile ──────────────────────────────────────
class ProfileUpdate(BaseModel):
    license_number: Optional[str] = None
    vehicle_type: Optional[str] = None   # "bike" | "car" | "truck"
    driving_years: Optional[int] = None
    age: Optional[int] = None
    state: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    license_number: Optional[str]
    vehicle_type: Optional[str]
    driving_years: Optional[int]
    age: Optional[int]
    state: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Violations ────────────────────────────────────────
class ViolationAdd(BaseModel):
    violation_id: str    # matches id field in your rules.json e.g. "V001"

class ViolationResponse(BaseModel):
    id: int
    violation_id: str
    name: str
    section: str
    points: int
    fine: float
    recorded_at: datetime

    class Config:
        from_attributes = True


# ── Risk Score ────────────────────────────────────────
class RiskScoreResponse(BaseModel):
    score: int
    label: str
    color: str
    total_violations: int
    total_points_lost: int
    total_fines: float


# ── Account Settings ──────────────────────────────────
class ChangeEmailRequest(BaseModel):
    current_password: str
    new_email: EmailStr

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class DeleteAccountRequest(BaseModel):
    password: str
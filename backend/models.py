from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    email            = Column(String, unique=True, index=True, nullable=False)
    full_name        = Column(String, nullable=False)
    hashed_password  = Column(String, nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)

    # Driving profile (filled after registration)
    license_number   = Column(String, nullable=True)
    vehicle_type     = Column(String, nullable=True)
    driving_years    = Column(Integer, nullable=True)
    age              = Column(Integer, nullable=True)
    state            = Column(String, nullable=True)

    violations    = relationship("Violation", back_populates="owner")
    conversations = relationship("Conversation", back_populates="owner")


class Violation(Base):
    __tablename__ = "violations"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    violation_id = Column(String, nullable=False)
    name         = Column(String, nullable=False)
    section      = Column(String, nullable=False)
    points       = Column(Integer, nullable=False)
    fine         = Column(Float, nullable=False)
    recorded_at  = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="violations")


class Conversation(Base):
    __tablename__ = "conversations"

    id         = Column(String, primary_key=True)       # e.g. "conv_1234_abc"
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False, default="New conversation")
    language   = Column(String, nullable=False, default="en")
    messages   = Column(Text, nullable=False, default="[]")  # JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="conversations")
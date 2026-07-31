from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth / User ───────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    formation: Optional[str] = None
    niveau: Optional[str] = None
    competences: Optional[List[str]] = []
    langues: Optional[List[str]] = []
    mobilite: Optional[str] = None
    domaines: Optional[List[str]] = []


class ProfileOut(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class RecommendationOut(BaseModel):
    id: int
    titre: str
    categorie: Optional[str]
    domaine: Optional[str]
    pays: Optional[str]
    ville: Optional[str]
    deadline: Optional[datetime]
    score: float
    source_url: Optional[str] = None

    class Config:
        from_attributes = True
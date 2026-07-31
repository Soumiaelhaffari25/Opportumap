from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, ARRAY, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    formation = Column(String, nullable=True)
    niveau = Column(String, nullable=True)
    competences = Column(ARRAY(String), default=[])
    langues = Column(ARRAY(String), default=[])
    mobilite = Column(String, nullable=True)
    domaines = Column(ARRAY(String), default=[])

    user = relationship("User", back_populates="profile")

    embedding = relationship(
        "ProfileEmbedding",
        back_populates="profile",
        uselist=False,
        cascade="all, delete-orphan",
        primaryjoin="Profile.user_id == ProfileEmbedding.user_id",
        foreign_keys="[ProfileEmbedding.user_id]",
    )

class ProfileEmbedding(Base):
    __tablename__ = "profile_embeddings"
 
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    embedding = Column(Vector(384), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
 
    profile = relationship(
        "Profile",
        foreign_keys=[user_id],
        primaryjoin="ProfileEmbedding.user_id == Profile.user_id",
        back_populates="embedding",
    )
 
    __table_args__ = (
        Index(
            "ix_profile_embeddings_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

class Opportunity(Base):
    __tablename__ = "opportunities"
 
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source_url = Column(String, nullable=True, unique=True)
    categorie = Column(String, nullable=True, index=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    niveau_requis = Column(String, nullable=True)
    domaine = Column(String, nullable=True, index=True)
    pays = Column(String, nullable=True)
    ville = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
 
    embedding = relationship(
        "OpportunityEmbedding",
        back_populates="opportunity",
        uselist=False,
        cascade="all, delete-orphan",
    )

class OpportunityEmbedding(Base):
    __tablename__ = "opportunity_embeddings"
 
    opportunity_id = Column(
        Integer,
        ForeignKey("opportunities.id", ondelete="CASCADE"),
        primary_key=True,
    )
    embedding = Column(Vector(384), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 
    opportunity = relationship("Opportunity", back_populates="embedding")
 
    __table_args__ = (
        Index(
            "ix_opportunity_embeddings_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), primary_key=True)
    saved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    applied_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="saved_opportunities")
    opportunity = relationship("Opportunity", backref="saved_by")
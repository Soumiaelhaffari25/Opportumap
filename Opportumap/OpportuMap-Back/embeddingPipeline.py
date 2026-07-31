import logging
import re
from typing import Optional

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from database import SessionLocal
from models import Profile, ProfileEmbedding, Opportunity, OpportunityEmbedding, SavedOpportunity

from datetime import datetime

#CONFIGURATION
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
BATCH_SIZE = 64
 
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


#CHARGEMENT DU MODELE
def load_model() -> SentenceTransformer:
    logger.info(f"Chargement du modèle : {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    logger.info("Modèle chargé.")
    return model

#NETTOYAGE DU TEXTE
def clean_text(text: str) -> str:
    if not text or not text.strip():
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s,./;:@+-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip()
    return text

#CONSTRUCTION DU TEXTE REPRESENTATIF
def build_profile_text(profile: Profile) -> str:
    """
    Construit une phrase structurée à partir d'un objet Profile SQLAlchemy.
    Les champs ARRAY (competences, langues, domaines) sont jointes par des virgules.
    """
    parts = []
 
    if profile.formation:
        parts.append(f"Formation : {profile.formation}")
    if profile.niveau:
        parts.append(f"Niveau : {profile.niveau}")
    if profile.competences:
        parts.append(f"Compétences : {', '.join(profile.competences)}")
    if profile.langues:
        parts.append(f"Langues : {', '.join(profile.langues)}")
    if profile.mobilite:
        parts.append(f"Mobilité : {profile.mobilite}")
    if profile.domaines:
        parts.append(f"Domaines : {', '.join(profile.domaines)}")
 
    return clean_text(". ".join(parts))

def build_opportunity_text(opportunity: Opportunity) -> str:
    """
    Construit une phrase structurée à partir d'un objet Opportunity SQLAlchemy.
    """
    parts = []
 
    if opportunity.titre:
        parts.append(f"Titre : {opportunity.titre}")
    if opportunity.categorie:
        parts.append(f"Catégorie : {opportunity.categorie}")
    if opportunity.domaine:
        parts.append(f"Domaine : {opportunity.domaine}")
    if opportunity.niveau_requis:
        parts.append(f"Niveau requis : {opportunity.niveau_requis}")
    if opportunity.description:
        parts.append(f"Description : {opportunity.description[:1000]}")
    if opportunity.pays or opportunity.ville:
        location = ", ".join(filter(None, [opportunity.ville, opportunity.pays]))
        parts.append(f"Localisation : {location}")
 
    return clean_text(". ".join(parts))


#GENERATION DES EMBEDDINGS
def generate_embeddings(model: SentenceTransformer, texts: list[str]) -> list:
    """
    Encode une liste de textes en vecteurs normalisés de dimension 384.
    normalize_embeddings=True permet d'utiliser le produit scalaire comme similarité cosinus.
    """
    return model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

#PIPELINES
def run_profile_pipeline(
    model: SentenceTransformer,
    user_id: Optional[int] = None,
) -> None:
    """
    Génère et stocke les embeddings des profils étudiants.
 
    Args:
        model   : modèle d'embedding chargé
        user_id : si fourni, recalcule uniquement ce profil (ex. après une mise à jour)
                  si None, traite tous les profils sans embedding existant
    """
    db = SessionLocal()
    try:
        query = db.query(Profile)
 
        if user_id:
            query = query.filter(Profile.user_id == user_id)
        else:
            # Uniquement les profils sans embedding — évite les recalculs inutiles
            query = query.outerjoin(ProfileEmbedding).filter(
                ProfileEmbedding.user_id == None  # noqa: E711
            )
 
        profiles = query.all()
 
        if not profiles:
            logger.info("Aucun profil à traiter.")
            return
 
        logger.info(f"{len(profiles)} profils à embedder.")
 
        # Construction et filtrage des textes vides
        data = [
            (profile.user_id, build_profile_text(profile))
            for profile in profiles
        ]
        data = [(uid, text) for uid, text in data if text]
 
        if not data:
            logger.warning("Tous les profils ont des champs vides.")
            return
 
        user_ids, texts = zip(*data)
        embeddings = generate_embeddings(model, list(texts))
 
        # Upsert via SQLAlchemy
        for uid, emb in zip(user_ids, embeddings):
            existing = db.query(ProfileEmbedding).filter(
                ProfileEmbedding.user_id == uid
            ).first()
 
            if existing:
                existing.embedding = emb.tolist()
            else:
                db.add(ProfileEmbedding(user_id=uid, embedding=emb.tolist()))
 
        db.commit()
        logger.info(f"{len(user_ids)} embeddings profils insérés/mis à jour.")
 
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur pipeline profils : {e}")
        raise
    finally:
        db.close()

def run_opportunity_pipeline(
    model: SentenceTransformer,
    opportunity_id: Optional[int] = None,
) -> None:
    """
    Génère et stocke les embeddings des opportunités.
 
    Args:
        model          : modèle d'embedding chargé
        opportunity_id : si fourni, recalcule uniquement cette opportunité
                         si None, traite toutes les opportunités actives sans embedding
    """
    db = SessionLocal()
    try:
        query = db.query(Opportunity)
 
        if opportunity_id:
            query = query.filter(Opportunity.id == opportunity_id)
        else:
            query = (
                query.filter(Opportunity.is_active == True)  # noqa: E712
                .outerjoin(OpportunityEmbedding)
                .filter(OpportunityEmbedding.opportunity_id == None)  # noqa: E711
            )
 
        opportunities = query.all()
 
        if not opportunities:
            logger.info("Aucune opportunité à traiter.")
            return
 
        logger.info(f"{len(opportunities)} opportunités à embedder.")
 
        data = [
            (opp.id, build_opportunity_text(opp))
            for opp in opportunities
        ]
        data = [(oid, text) for oid, text in data if text]
 
        if not data:
            logger.warning("Toutes les opportunités ont des champs vides.")
            return
 
        opp_ids, texts = zip(*data)
        embeddings = generate_embeddings(model, list(texts))
 
        for oid, emb in zip(opp_ids, embeddings):
            existing = db.query(OpportunityEmbedding).filter(
                OpportunityEmbedding.opportunity_id == oid
            ).first()
 
            if existing:
                existing.embedding = emb.tolist()
            else:
                db.add(OpportunityEmbedding(opportunity_id=oid, embedding=emb.tolist()))
 
        db.commit()
        logger.info(f"{len(opp_ids)} embeddings opportunités insérés/mis à jour.")
 
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur pipeline opportunités : {e}")
        raise
    finally:
        db.close()


def get_recommendations(user_id: int, top_k: int = 10) -> list[dict]:
    """
    Retourne les top_k opportunités les plus similaires au profil d'un étudiant.
    Utilise l'opérateur <=> de pgvector (distance cosinus).
    """
    db = SessionLocal()
    try:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return []

        profile_emb = db.query(ProfileEmbedding).filter(
            ProfileEmbedding.user_id == user_id
        ).first()
        if not profile_emb:
            return []

        results = (
            db.query(Opportunity, OpportunityEmbedding)
            .join(OpportunityEmbedding)
            .filter(Opportunity.is_active == True)  # noqa: E712
            .all()
        )
        if not results:
            return []

        scored = []
        for opp, emb in results:

            # SIMILARITÉ COSINUS (depuis les embeddings pré-calculés)
            score = cosine_similarity(
                    [emb.embedding],
                    [profile_emb.embedding]
                )[0][0]
            # COLLABORATIVE FILTERING
            saved_count = db.query(SavedOpportunity).filter(
                SavedOpportunity.opportunity_id == opp.id
            ).count()
            score += saved_count * 0.1

            # BOOST NIVEAU
            if (
                opp.niveau_requis
                and profile.niveau
                and profile.niveau.lower() == opp.niveau_requis.lower()
            ):
                score += 0.15

            # BOOST GÉOGRAPHIQUE
            if (
                opp.pays
                and profile.mobilite
                and profile.mobilite.lower() == opp.pays.lower()
            ):
                score += 0.10

            # BOOST DEADLINE
            if opp.deadline:
                days_left = (opp.deadline.date() - datetime.today().date()).days
                if days_left > 30:
                    score += 0.05
                elif days_left < 7:
                    score -= 0.05

            scored.append({"opportunity": opp, "score": round(score, 3)})

        scored.sort(key=lambda x: x["score"], reverse=True)

        return [
            {
                "id": r["opportunity"].id,
                "titre": r["opportunity"].titre,
                "categorie": r["opportunity"].categorie,
                "domaine": r["opportunity"].domaine,
                "pays": r["opportunity"].pays,
                "ville": r["opportunity"].ville,
                "deadline": r["opportunity"].deadline,
                "score": r["score"],
                "source_url":r["opportunity"].source_url
            }
            for r in scored[:top_k]
        ]

    finally:
        db.close()
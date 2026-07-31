from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from contextlib import asynccontextmanager
from embeddingPipeline import load_model,run_opportunity_pipeline, run_profile_pipeline, get_recommendations

from database import get_db, engine, create_tables
import models, schemas, crud, auth

model = load_model()


@asynccontextmanager
async def lifespan(app:FastAPI):
    run_opportunity_pipeline(model)
    create_tables()
    yield

app = FastAPI(title="OpportuMap API", lifespan = lifespan, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")



def get_current_user(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db),):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        user_id = int(user_id)
    except ValueError:
        raise credentials_exception
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=schemas.UserOut, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    return crud.create_user(db, user_in)


@app.post("/api/auth/login",response_model=schemas.Token,)
def login(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db),):
    user = crud.authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(hours=24),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user


# ── Profile ───────────────────────────────────────────────────────────────────

@app.get("/api/auth/profile", response_model=schemas.ProfileOut)
def get_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    profile = crud.get_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return profile


@app.post("/api/auth/profile", response_model=schemas.ProfileOut, status_code=201)
def create_profile(
    profile_in: schemas.ProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if crud.get_profile(db, current_user.id):
        raise HTTPException(status_code=400, detail="Profil déjà existant, utilisez PUT")
    profile = crud.create_profile(db, current_user.id, profile_in)

    run_profile_pipeline(model, user_id=current_user.id)

    return profile


@app.put("/api/auth/profile", response_model=schemas.ProfileOut)
def update_profile(
    profile_in: schemas.ProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = crud.get_profile(db, current_user.id)
    if not profile:
        return crud.create_profile(db, current_user.id, profile_in)
    run_profile_pipeline(model, user_id=current_user.id)
    return crud.update_profile(db, profile, profile_in)



#── Recomendations───────────────────────────────────────────────────────────────────
@app.get("/api/auth/recommendations", response_model=list[schemas.RecommendationOut])
def recommendations(
    top_k: int = 10,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = crud.get_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")

    profile_emb = db.query(models.ProfileEmbedding).filter(
        models.ProfileEmbedding.user_id == current_user.id
    ).first()
    if not profile_emb:
        raise HTTPException(
            status_code=404,
            detail="Embedding non trouvé — lancez d'abord la pipeline NLP",
        )

    results = get_recommendations(user_id=current_user.id, top_k=top_k)
    return results


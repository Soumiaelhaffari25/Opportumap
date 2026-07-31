# OpportuMap

**Moteur Hybride Personnalisé d'Agrégation et de Recommandation d'Opportunités par NLP et Indexation Vectorielle**

OpportuMap est une plateforme centralisée et intelligente qui agrège des opportunités académiques et professionnelles (stages/PFE, emplois, bourses, hackathons) depuis des sources hétérogènes, puis les recommande aux étudiants grâce à un moteur de scoring hybride basé sur le Traitement Automatique du Langage Naturel (NLP) et la recherche vectorielle.

> *« Toutes vos opportunités, au même endroit. »*

---

## 🎯 Problématique

Les étudiants marocains en fin de cycle font face à une **fragmentation informationnelle sévère** : les opportunités sont dispersées entre LinkedIn, Rekrute.com, Campus France, AMCI, Devpost, etc. Cela engendre :

- **Coût cognitif et temporel élevé** — plusieurs heures de veille manuelle par semaine.
- **Asymétrie d'information** — des offres critiques expirent sans être détectées.
- **Absence de contextualisation sémantique** — les moteurs classiques (keyword matching) ratent des offres proches conceptuellement (ex. « Data Engineering » vs « Consultant Big Data »).

OpportuMap répond à ces limites en injectant une couche d'IA qui qualifie et ordonne les offres selon le profil réel de chaque étudiant.

---

## ✨ Fonctionnalités

- **Agrégation multi-sources** — scraping HTML + flux RSS/Atom (9 sources intégrées).
- **Recommandations sémantiques** — embeddings multilingues (FR / AR / EN) via SentenceTransformers.
- **Scoring hybride** — similarité cosinus + filtrage collaboratif + boosts contextuels (niveau, géographie, deadline).
- **Recherche vectorielle rapide** — index HNSW (pgvector) pour la recherche approximative de plus proches voisins.
- **Planification automatique** — collecte et indexation nocturnes (2h00) sans intervention humaine.
- **Authentification sécurisée** — JWT (OAuth2) + hachage bcrypt.
- **Interface moderne** — dashboard de recommandations avec scores, filtres Top 5 / 10 / 20 et liens sources directs.

---

## 🏗️ Architecture & Stack technique

| Couche | Technologie |
|---|---|
| **Backend API** | FastAPI (Python 3.11+) |
| **Base de données** | PostgreSQL + extension `pgvector` |
| **ORM** | SQLAlchemy |
| **NLP / Embeddings** | SentenceTransformers (`paraphrase-multilingual-MiniLM-L12-v2`, 384D) |
| **Authentification** | JWT (OAuth2 / bcrypt) |
| **Scraping** | Requests + BeautifulSoup + feedparser |
| **Planification** | APScheduler (BackgroundScheduler) |
| **Frontend** | React / Vue (Vite, port 5173) |

### Modèle de données

| Entité | Rôle |
|---|---|
| `User` | Compte utilisateur (email + mot de passe hashé) |
| `Profile` | Profil académique et préférences de l'étudiant |
| `Opportunity` | Offre agrégée (emploi, stage, bourse, hackathon) |
| `ProfileEmbedding` | Vecteur NLP 384D du profil |
| `OpportunityEmbedding` | Vecteur NLP 384D de l'opportunité |
| `SavedOpportunity` | Opportunité sauvegardée par un utilisateur |

---

## 🔌 Sources de données intégrées

| Source | Méthode | Catégorie | Géographie |
|---|---|---|---|
| Devpost | HTML scraping | Hackathon | International |
| Rekrute.com | HTML scraping | Emploi | Maroc |
| Dev.to | RSS | Tech | International |
| AfDB | RSS | Bourse | Afrique |
| LinkedIn | Google News RSS | Stage | International |
| Indeed | Google News RSS | Emploi | International |
| Campus France | Google News RSS | Bourse | France |
| AMCI | Google News RSS | Bourse | Maroc |
| HEC / Grandes Écoles | Google News RSS | Formation | France |

La robustesse est assurée par un bloc `try/except` par source (une source défaillante n'interrompt pas les autres) et la détection de doublons via le champ `source_url` UNIQUE.

---

## 🧠 Algorithme de scoring hybride

Le score final combine plusieurs signaux pondérés :

```
Score(u, o) = cosine(e_u, e_o)          # similarité NLP
            + 0.10 × n_saves             # filtrage collaboratif
            + 0.15 × 1[niveau match]     # boost niveau
            + 0.10 × 1[géo match]        # boost géographique
            + Δ_deadline                 # ± 0.05 selon urgence
```

L'approche hybride compense le *cold start* par les embeddings de profil tout en exploitant les données comportementales dès qu'elles sont disponibles.

---

## 🚀 Installation & démarrage

### Prérequis

- Python 3.11+
- PostgreSQL avec l'extension `pgvector`
- Node.js 18+ (frontend)

### Backend

```bash
# Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/opportumap.git
cd opportumap

# Environnement virtuel
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate

# Dépendances
pip install -r requirements.txt

# Base de données : activer pgvector
psql -d opportumap -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Variables d'environnement (voir .env.example)
cp .env.example .env

# Lancer l'API
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## 📡 API REST — Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription (email + mot de passe) |
| `POST` | `/api/auth/login` | Connexion → JWT Bearer token |
| `GET` | `/api/auth/me` | Profil utilisateur connecté |
| `GET` | `/api/auth/profile` | Lecture du profil académique |
| `POST` | `/api/auth/profile` | Création du profil |
| `PUT` | `/api/auth/profile` | Mise à jour du profil + recalcul de l'embedding |
| `GET` | `/api/auth/recommendations` | Top-K recommandations personnalisées |

Toutes les routes sont sécurisées par JWT, sauf celles d'authentification.

---

## ⏰ Planification automatique

Un job nocturne (`CronTrigger`, chaque nuit à **2h00**) exécute séquentiellement :

1. `scrape_devPost()` — Hackathons Devpost
2. `multiscrape()` — RSS multi-sources
3. `scrape_rekrute()` — Offres Rekrute.com (20 pages)
4. `run_opportunity_pipeline(model)` — Génération des embeddings des nouvelles opportunités

Le scheduler s'exécute dans un thread daemon séparé et est démarré/arrêté proprement via le gestionnaire de cycle de vie `lifespan` de FastAPI.

---

## 🗺️ Limites actuelles & perspectives

**Limites**
- Deadlines fixées statiquement à `2026-12-31` pour les sources ne les publiant pas.
- Niveau requis par défaut à `"Master"`.
- Sites à rendu JavaScript (SPA) non encore supportés.

**Perspectives**
- Migration vers Scrapy pour une architecture de scraping plus robuste.
- Support des sites dynamiques via Selenium / Playwright.
- Endpoint d'administration pour déclencher le scraping à la demande.
- Notifications intelligentes et analyse automatique des CV.

---

## 👥 Auteurs

- **Soumia El Haffari**
- **Souley Kossi Adelphe**

---

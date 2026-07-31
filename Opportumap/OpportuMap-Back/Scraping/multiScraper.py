
import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
        )
    )
)

import requests
import feedparser

from bs4 import BeautifulSoup

from database import SessionLocal
from models import Opportunity


db = SessionLocal()


def save_opportunity(
    titre,
    description,
    categorie,
    pays,
    ville
):

    existing = db.query(Opportunity).filter(
        Opportunity.titre == titre
    ).first()

    if existing:
        return

    opportunity = Opportunity(

        titre=titre,

        description=description[:1000],

        categorie=categorie,

        deadline="2026-12-31",

        pays=pays,

        ville=ville,

        niveau_requis="Master"
    )

    db.add(opportunity)


# =========================
# DEVPOST
# =========================

try:

    url = "https://devpost.com/hackathons"

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(
        url,
        headers=headers
    )

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    titles = soup.find_all("h2")

    for title in titles[:5]:

        titre = title.text.strip()

        if len(titre) > 5:

            save_opportunity(

                titre=titre,

                description="Hackathon from Devpost",

                categorie="Hackathon",

                pays="International",

                ville="Remote"
            )

except Exception as e:

    print("Devpost scraping error:", e)


# =========================
# DEV.TO RSS
# =========================

try:

    feed = feedparser.parse(
        "https://dev.to/feed"
    )

    for entry in feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="Tech",

            pays="International",

            ville="Remote"
        )

except Exception as e:

    print("RSS scraping error:", e)


# =========================
# AFRICAN DEVELOPMENT BANK
# =========================

try:

    feed = feedparser.parse(
        "https://www.afdb.org/en/news-and-events/rss"
    )

    for entry in feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="Scholarship",

            pays="Africa",

            ville="Remote"
        )

except Exception as e:

    print("AfDB scraping error:", e)

# =========================
# LINKEDIN RSS
# =========================

try:

    linkedin_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=linkedin+internship+AI"
    )

    for entry in linkedin_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="LinkedIn Internship",

            pays="International",

            ville="Remote"
        )

except Exception as e:

    print("LinkedIn RSS error:", e)

# =========================
# INDEED RSS
# =========================

try:

    indeed_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=indeed+data+science+jobs"
    )

    for entry in indeed_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="Indeed Job",

            pays="International",

            ville="Remote"
        )

except Exception as e:

    print("Indeed RSS error:", e)

# =========================
# CAMPUS FRANCE
# =========================

try:

    campus_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=Campus+France+scholarship"
    )

    for entry in campus_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="Campus France",

            pays="France",

            ville="Paris"
        )

except Exception as e:

    print("Campus France scraping error:", e)

# =========================
# AMCI / BOURSES
# =========================

try:

    amci_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=Morocco+scholarship+AMCI"
    )

    for entry in amci_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="AMCI Scholarship",

            pays="Maroc",

            ville="Rabat"
        )

except Exception as e:

    print("AMCI scraping error:", e) 

# =========================
# BOURSE SCHOLARSHIP
# =========================

try:

    scholarship_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=international+scholarship"
    )

    for entry in scholarship_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="Scholarship",

            pays="International",

            ville="Remote"
        )

except Exception as e:

    print("Scholarship scraping error:", e)

# =========================
# HEC / GRANDES ECOLES
# =========================

try:

    hec_feed = feedparser.parse(
        "https://news.google.com/rss/search?q=HEC+business+school"
    )

    for entry in hec_feed.entries[:5]:

        save_opportunity(

            titre=entry.title,

            description=entry.summary,

            categorie="HEC / Grandes Ecoles",

            pays="France",

            ville="Paris"
        )

except Exception as e:

    print("HEC scraping error:", e)


db.commit()

print("✅ Multi-source scraping completed")
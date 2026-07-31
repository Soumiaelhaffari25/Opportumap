import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

import requests

from bs4 import BeautifulSoup

from database import SessionLocal
from models import Opportunity

db = SessionLocal()

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

for title in titles[:10]:

    titre = title.text.strip()

    if len(titre) < 5:
        continue

    existing = db.query(Opportunity).filter(
        Opportunity.titre == titre
    ).first()

    if existing:
        continue

    opportunity = Opportunity(

        titre=titre,

        description="Hackathon opportunity from Devpost",

        categorie="Hackathon",

        deadline="2026-12-31",

        pays="International",

        ville="Remote",

        niveau_requis="Master"
    )

    db.add(opportunity)

db.commit()

print("✅ Devpost hackathons imported")
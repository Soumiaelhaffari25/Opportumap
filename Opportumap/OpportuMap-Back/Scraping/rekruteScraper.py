import sys
import os
import re
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

from datetime import datetime


db = SessionLocal()

BASE_URL = "https://www.rekrute.com"
MAX_PAGES = 20

for page in range(1, MAX_PAGES + 1):
    print(f"\n========== PAGE {page} ==========\n")

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    url = (
        f"{BASE_URL}/offres-emploi-maroc.html"
        f"?p={page}"
    )

    response = requests.get(
        url,
        headers=headers
    )

    if response.status_code != 200:
        print("Erreur lors de la récupération de la page")
        sys.exit()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    # Toutes les cartes d'offres
    offers = soup.find_all("li", class_="post-id")

    print(f"{len(offers)} offres trouvées")

    for offer in offers:

        try:

            # =========================
            # TITRE
            # =========================

            title_tag = offer.find("a", class_="titreJob")

            if not title_tag:
                continue
            raw_title = title_tag.text.strip()
            if " | " in raw_title :
                parts = raw_title.split(" | ", 1)
                titre = parts[0].strip()
                city_match = re.match(r"^([^(]+)", parts[1].strip())
                ville = city_match.group(1).strip() if city_match else parts[1].strip()

            # =========================
            # URL SOURCE
            # =========================

            source_url = title_tag.get("href")

            if source_url:

                if not source_url.startswith("http"):

                    source_url = (
                        "https://www.rekrute.com"
                        + source_url
                    )

            # =========================
            # VERIFICATION DOUBLON
            # =========================

            existing = db.query(Opportunity).filter(
                Opportunity.source_url == source_url
            ).first()

            if existing:
                print(f"Déjà existant : {titre}")
                continue

            # =========================
            # ENTREPRISE / DESCRIPTION
            # =========================

            company_tag = offer.find(
                "span",
                class_="name"
            )

            description = None

            info_div = offer.find(
                "div",
                class_="info"
            )

            if info_div:

                description_span = info_div.find("span")

                if description_span:

                    description = (
                        description_span
                        .get_text(" ", strip=True)
                    )

            if company_tag:
                description = (
                    "Offre d'emploi chez "
                    + company_tag.text.strip()
                )

            # =========================
            # DOMAINE
            # =========================

            domaine = None

            details = offer.find_all("li")

            for detail in details:

                text = detail.get_text(strip=True)

                if "Secteur d'activité" in text:

                    link = detail.find("a")

                    if link:
                        domaine = link.text.strip()

                    break

            # =========================
            # CREATION OBJET
            # =========================

            opportunity = Opportunity(

                titre=titre,

                description=description,

                source_url=source_url,

                categorie="Emploi",

                deadline=None,

                niveau_requis=None,

                domaine=domaine,

                pays="Maroc",

                ville=ville,

                is_active=True
            )

            db.add(opportunity)

            print(f"Ajouté : {titre}")

        except Exception as e:

            print(f"Erreur : {e}")

    # =========================
    # COMMIT FINAL
    # =========================

    db.commit()

    db.close()

print("✅ Scraping terminé")
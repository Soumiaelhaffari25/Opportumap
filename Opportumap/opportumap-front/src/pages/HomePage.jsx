import { useState, useEffect } from "react";

const NAV_LINKS = ["Fonctionnalités", "Comment ça marche", "À propos"];

const FEATURES = [
  {
    icon: "🎯",
    title: "Matching intelligent",
    desc: "Des opportunités sélectionnées selon votre formation, vos compétences et vos langues.",
  },
  {
    icon: "🗺️",
    title: "Vue cartographique",
    desc: "Visualisez les offres autour de vous selon votre mobilité et vos préférences géographiques.",
  },
  {
    icon: "📂",
    title: "Toutes les opportunités",
    desc: "Emplois, stages, alternances, bénévolat — tout au même endroit, mis à jour en temps réel.",
  },
  {
    icon: "⚡",
    title: "Profil unique",
    desc: "Créez votre profil une seule fois. Vos informations voyagent avec vous sur toutes les offres.",
  },
];

const STEPS = [
  {
    num: "01",
    label: "Créez votre compte",
    detail: "Inscription en moins de 2 minutes.",
  },
  {
    num: "02",
    label: "Complétez votre profil",
    detail: "Formation, compétences, langues, mobilité.",
  },
  {
    num: "03",
    label: "Découvrez vos matches",
    detail: "Des opportunités taillées sur mesure vous attendent.",
  },
];

const STATS = [
  { value: "12 000+", label: "Opportunités actives" },
  { value: "3 400+", label: "Jeunes accompagnés" },
  { value: "98%", label: "Taux de satisfaction" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#0a0a0f",
        color: "#f0ede8",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(1deg); }
          66%       { transform: translateY(6px) rotate(-1deg); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10%       { transform: translate(-2%, -3%); }
          30%       { transform: translate(3%, -1%); }
          50%       { transform: translate(-1%, 3%); }
          70%       { transform: translate(2%, 1%); }
          90%       { transform: translate(-3%, 2%); }
        }

        .nav-link {
          color: #a8a29e; font-size: 14px; text-decoration: none; letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #f0ede8; }

        .btn-primary {
          background: #e8ff6b; color: #0a0a0f; border: none; border-radius: 100px;
          padding: 14px 32px; font-size: 15px; font-weight: 500; cursor: pointer;
          font-family: inherit; letter-spacing: 0.01em; transition: transform 0.15s, box-shadow 0.15s;
          text-decoration: none; display: inline-block;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,255,107,0.25); }
        .btn-primary:active { transform: scale(0.98); }

        .btn-ghost {
          background: transparent; color: #f0ede8; border: 1px solid rgba(240,237,232,0.2);
          border-radius: 100px; padding: 14px 32px; font-size: 15px; cursor: pointer;
          font-family: inherit; transition: border-color 0.2s, background 0.2s;
          text-decoration: none; display: inline-block;
        }
        .btn-ghost:hover { border-color: rgba(240,237,232,0.5); background: rgba(240,237,232,0.05); }

        .feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px; transition: transform 0.3s, background 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-6px); background: rgba(255,255,255,0.06);
          border-color: rgba(232,255,107,0.2);
        }

        .step-item { border-top: 1px solid rgba(255,255,255,0.1); padding: 28px 0; display: flex; gap: 32px; align-items: flex-start; }

        .stat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 28px 32px; text-align: center;
        }

        .grain-overlay {
          position: fixed; top: -200%; left: -200%; width: 500%; height: 500%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025; pointer-events: none; z-index: 9999;
          animation: grain 0.8s steps(1) infinite;
        }
      `}</style>

      <div className="grain-overlay" />

      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "-20vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse, rgba(232,255,107,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 5vw",
          background: scrolled ? "rgba(10,10,15,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.4s, border 0.4s",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#e8ff6b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14 }}>◈</span>
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "#f0ede8",
              letterSpacing: "-0.02em",
            }}
          >
            OpportuMap
          </span>
        </div>

        <div style={{ display: "flex", gap: 36 }}>
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="nav-link">
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="/login"
            className="btn-ghost"
            style={{ padding: "10px 22px", fontSize: 14 }}
          >
            Connexion
          </a>
          <a
            href="/register"
            className="btn-primary"
            style={{ padding: "10px 22px", fontSize: 14 }}
          >
            Commencer
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "18vh",
          paddingBottom: "14vh",
          paddingLeft: "5vw",
          paddingRight: "5vw",
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(232,255,107,0.08)",
            border: "1px solid rgba(232,255,107,0.2)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 40,
            animation: "fadeUp 0.6s ease both",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#e8ff6b",
              display: "inline-block",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: "#e8ff6b",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            BÊTA OUVERTE
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(44px, 8vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#f0ede8",
            marginBottom: 28,
            animation: "fadeUp 0.6s 0.1s ease both",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Toutes vos opportunités,
          <br />
          <span style={{ color: "#e8ff6b" }}>au même endroit.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "#78716c",
            lineHeight: 1.7,
            maxWidth: 580,
            margin: "0 auto 48px",
            animation: "fadeUp 0.6s 0.2s ease both",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          OpportuMap centralise emplois, stages et alternances et les fait
          correspondre à{" "}
          <em style={{ color: "#a8a29e", fontStyle: "normal" }}>
            votre profil
          </em>{" "}
          — formation, compétences, langues, mobilité.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "fadeUp 0.6s 0.3s ease both",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <a href="/register" className="btn-primary">
            Créer mon profil gratuitement
          </a>
          <a href="#how" className="btn-ghost">
            Voir comment ça marche
          </a>
        </div>

        {/* Floating card */}
        <div
          style={{
            marginTop: 80,
            display: "inline-flex",
            flexDirection: "column",
            gap: 12,
            animation:
              "fadeUp 0.6s 0.4s ease both, float 6s 1s ease-in-out infinite",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          {[
            {
              role: "Stage UX Design",
              co: "Agence Noor · Rabat",
              match: "97%",
            },
            {
              role: "Développeur fullstack",
              co: "TechMaroc · Casablanca",
              match: "91%",
            },
            {
              role: "Alternance Data",
              co: "Bank Al-Maghrib · Rabat",
              match: "88%",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                textAlign: "left",
                minWidth: 340,
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#f0ede8",
                    marginBottom: 2,
                  }}
                >
                  {item.role}
                </p>
                <p style={{ fontSize: 12, color: "#78716c" }}>{item.co}</p>
              </div>
              <div
                style={{
                  background: "rgba(232,255,107,0.1)",
                  border: "1px solid rgba(232,255,107,0.25)",
                  borderRadius: 100,
                  padding: "4px 12px",
                }}
              >
                <span
                  style={{ fontSize: 13, color: "#e8ff6b", fontWeight: 500 }}
                >
                  {item.match}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "6vh 5vw",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <p
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 36,
                  color: "#e8ff6b",
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 14, color: "#78716c" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "10vh 5vw",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.1em",
            color: "#e8ff6b",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          FONCTIONNALITÉS
        </p>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 56,
            maxWidth: 500,
          }}
        >
          Conçu pour les jeunes qui cherchent.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#f0ede8",
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "10vh 5vw",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.1em",
            color: "#e8ff6b",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          COMMENT ÇA MARCHE
        </p>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 44px)",
            letterSpacing: "-0.03em",
            marginBottom: 48,
          }}
        >
          Trois étapes. C'est tout.
        </h2>
        {STEPS.map((s, i) => (
          <div key={i} className="step-item">
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "#e8ff6b",
                letterSpacing: "0.08em",
                minWidth: 36,
              }}
            >
              {s.num}
            </span>
            <div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#f0ede8",
                  marginBottom: 6,
                }}
              >
                {s.label}
              </p>
              <p style={{ fontSize: 14, color: "#78716c" }}>{s.detail}</p>
            </div>
          </div>
        ))}
        {STEPS.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} />
        )}
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "10vh 5vw",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(232,255,107,0.04)",
            border: "1px solid rgba(232,255,107,0.12)",
            borderRadius: 28,
            padding: "64px 40px",
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 42px)",
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            Prêt à trouver votre prochaine opportunité ?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#78716c",
              marginBottom: 36,
              lineHeight: 1.65,
            }}
          >
            Rejoignez des milliers de jeunes qui ont déjà trouvé leur voie grâce
            à OpportuMap.
          </p>
          <a
            href="/register"
            className="btn-primary"
            style={{ fontSize: 16, padding: "16px 40px" }}
          >
            Commencer gratuitement
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "40px 5vw",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "#e8ff6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 12 }}>◈</span>
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "-0.02em",
              }}
            >
              OpportuMap
            </span>
          </div>

          <div style={{ display: "flex", gap: 32 }}>
            {["Confidentialité", "CGU", "Contact", "À propos"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 13,
                  color: "#57534e",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#a8a29e")}
                onMouseLeave={(e) => (e.target.style.color = "#57534e")}
              >
                {l}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 13, color: "#44403c" }}>
            © 2026 OpportuMap. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

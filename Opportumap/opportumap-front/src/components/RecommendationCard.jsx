import { useState, useEffect } from "react";
import { useAuth } from "../service/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Expiré", urgent: false, expired: true };
  if (diffDays === 0)
    return { label: "Aujourd'hui", urgent: true, expired: false };
  if (diffDays <= 7)
    return { label: `${diffDays}j restants`, urgent: true, expired: false };
  return {
    label: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    urgent: false,
    expired: false,
  };
}

function scoreColor(score) {
  if (score >= 0.8)
    return {
      bg: "rgba(107,255,160,0.1)",
      border: "rgba(107,255,160,0.25)",
      text: "#6bffa0",
    };
  if (score >= 0.6)
    return {
      bg: "rgba(232,255,107,0.08)",
      border: "rgba(232,255,107,0.2)",
      text: "#e8ff6b",
    };
  return {
    bg: "rgba(255,180,107,0.08)",
    border: "rgba(255,180,107,0.2)",
    text: "#ffb46b",
  };
}

function categoryIcon(categorie) {
  const map = {
    emploi: "💼",
    stage: "🎓",
    alternance: "🔄",
    bénévolat: "🤝",
    freelance: "⚡",
    formation: "📚",
  };
  return map[(categorie || "").toLowerCase()] || "📌";
}

// ── RecommendationCard ────────────────────────────────────────────────────────

export function RecommendationCard({ rec, index = 0 }) {
  const deadline = formatDeadline(rec.deadline);
  const score = scoreColor(rec.score);

  return (
    <article
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        cursor: "pointer",
        transition:
          "transform 0.25s ease, border-color 0.25s ease, background 0.25s ease",
        animation: `fadeUp 0.4s ${index * 0.06}s ease both`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(232,255,107,0.2)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {categoryIcon(rec.categorie)}
          </div>
          <div>
            {rec.categorie && (
              <p
                style={{
                  fontSize: 11,
                  color: "#57534e",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 2,
                }}
              >
                {rec.categorie}
              </p>
            )}
            <h3
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#f0ede8",
                lineHeight: 1.35,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {rec.titre}
            </h3>
          </div>
        </div>

        {/* Score badge */}
        <div
          style={{
            background: score.bg,
            border: `1px solid ${score.border}`,
            borderRadius: 100,
            padding: "4px 12px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: score.text,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {Math.round(rec.score * 100)}%
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(rec.ville || rec.pays) && (
          <span style={tagStyle}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[rec.ville, rec.pays].filter(Boolean).join(", ")}
          </span>
        )}
        {rec.domaine && (
          <span style={tagStyle}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {rec.domaine}
          </span>
        )}
        {deadline && !deadline.expired && (
          <span
            style={{
              ...tagStyle,
              color: deadline.urgent ? "#ffb46b" : "#78716c",
              borderColor: deadline.urgent
                ? "rgba(255,180,107,0.25)"
                : "rgba(255,255,255,0.07)",
              background: deadline.urgent
                ? "rgba(255,180,107,0.06)"
                : "rgba(255,255,255,0.03)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {deadline.label}
          </span>
        )}
        {deadline?.expired && (
          <span
            style={{
              ...tagStyle,
              color: "#666",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            Expiré
          </span>
        )}
      </div>

      {/* Footer */}
      <div
        style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}
      >
        {rec.source_url ? (
          <a
            href={rec.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#e8ff6b",
              fontFamily: "'DM Sans', sans-serif",
              background: "rgba(232,255,107,0.08)",
              border: "1px solid rgba(232,255,107,0.2)",
              borderRadius: 100,
              padding: "7px 16px",
              textDecoration: "none",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232,255,107,0.14)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(232,255,107,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(232,255,107,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Voir plus
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <span style={{ fontSize: 12, color: "#44403c", fontStyle: "italic" }}>
            Lien non disponible
          </span>
        )}
      </div>
    </article>
  );
}

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: "#78716c",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 100,
  padding: "4px 10px",
};

// ── RecommendationList ────────────────────────────────────────────────────────

export default function RecommendationList() {
  const { token, api } = useAuth();
  const [recs, setRecs] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | empty | error | no-profile
  const [topK, setTopK] = useState(10);

  useEffect(() => {
    setStatus("loading");
    fetch(`${api}/recommendations?top_k=${topK}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 404)
          return r
            .json()
            .then((d) => Promise.reject({ type: "404", detail: d.detail }));
        if (!r.ok) return Promise.reject({ type: "error" });
        return r.json();
      })
      .then((data) => {
        setRecs(data);
        setStatus(data.length === 0 ? "empty" : "ok");
      })
      .catch((err) => {
        if (err.type === "404")
          setStatus(
            err.detail?.includes("profil") ? "no-profile" : "no-embedding",
          );
        else setStatus("error");
      });
  }, [topK]);

  return (
    <section>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.03em",
              color: "#f0ede8",
              marginBottom: 4,
            }}
          >
            Recommandations
          </h2>
          {status === "ok" && (
            <p style={{ fontSize: 13, color: "#57534e" }}>
              {recs.length} opportunité{recs.length > 1 ? "s" : ""} trouvée
              {recs.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Top-K selector */}
        <div style={{ display: "flex", gap: 6 }}>
          {[5, 10, 20].map((k) => (
            <button
              key={k}
              onClick={() => setTopK(k)}
              style={{
                padding: "7px 16px",
                borderRadius: 100,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                border: "1px solid",
                transition: "all 0.2s",
                background:
                  topK === k ? "rgba(232,255,107,0.08)" : "transparent",
                borderColor:
                  topK === k
                    ? "rgba(232,255,107,0.25)"
                    : "rgba(255,255,255,0.08)",
                color: topK === k ? "#e8ff6b" : "#78716c",
              }}
            >
              Top {k}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {status === "loading" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 0",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid rgba(255,255,255,0.08)",
              borderTopColor: "#e8ff6b",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        </div>
      )}

      {status === "no-profile" && (
        <StateCard
          icon="👤"
          title="Profil incomplet"
          desc="Complétez votre profil pour recevoir des recommandations personnalisées."
          action={{ label: "Compléter mon profil", href: "/profile" }}
        />
      )}
      {status === "no-embedding" && (
        <StateCard
          icon="⚙️"
          title="Analyse en cours"
          desc="Votre profil n'a pas encore été analysé par notre moteur NLP. Revenez dans quelques instants."
        />
      )}
      {status === "error" && (
        <StateCard
          icon="⚠️"
          title="Erreur"
          desc="Impossible de charger les recommandations. Réessayez dans un moment."
        />
      )}
      {status === "empty" && (
        <StateCard
          icon="🔍"
          title="Aucun résultat"
          desc="Aucune opportunité ne correspond à votre profil pour le moment. Enrichissez vos compétences ou domaines."
        />
      )}

      {/* Grid */}
      {status === "ok" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {recs.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function StateCard({ icon, title, desc, action }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "48px 32px",
        textAlign: "center",
        animation: "fadeUp 0.4s ease both",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "#f0ede8",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#57534e",
          lineHeight: 1.6,
          maxWidth: 320,
          margin: "0 auto 20px",
        }}
      >
        {desc}
      </p>
      {action && (
        <a
          href={action.href}
          style={{
            display: "inline-block",
            background: "rgba(232,255,107,0.08)",
            border: "1px solid rgba(232,255,107,0.2)",
            borderRadius: 100,
            padding: "10px 24px",
            fontSize: 13,
            color: "#e8ff6b",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

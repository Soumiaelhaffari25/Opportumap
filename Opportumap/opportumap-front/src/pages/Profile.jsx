import { useState, useEffect } from "react";
import { useAuth } from "../service/AuthContext";

const NIVEAUX = [
  "Bac",
  "Bac+2",
  "Bac+3",
  "Bac+4 (Licence)",
  "Bac+5 (Master)",
  "Doctorat",
  "Autre",
];
const MOBILITE_OPTIONS = [
  "Sur place",
  "Région",
  "National",
  "International",
  "Full remote",
];
const LANGUES_SUGGERES = [
  "Français",
  "Anglais",
  "Arabe",
  "Espagnol",
  "Allemand",
  "Italien",
  "Portugais",
  "Mandarin",
];
const DOMAINES_SUGGERES = [
  "Développement web",
  "Data / IA",
  "DevOps",
  "Cybersécurité",
  "Design UX",
  "Marketing digital",
  "Finance",
  "Logistique",
  "Statistiques",
];

function TagInput({ values, onChange, suggestions, placeholder }) {
  const [input, setInput] = useState("");

  const add = (val) => {
    const clean = val.trim();
    if (clean && !values.includes(clean)) onChange([...values, clean]);
    setInput("");
  };

  const remove = (v) => onChange(values.filter((x) => x !== v));

  return (
    <div className="tag-input-wrap">
      <div className="tags">
        {values.map((v) => (
          <span key={v} className="tag">
            {v}
            <button type="button" onClick={() => remove(v)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(input);
          }
        }}
        placeholder={placeholder}
      />
      {suggestions && (
        <div className="suggestions">
          {suggestions
            .filter(
              (s) =>
                !values.includes(s) &&
                s.toLowerCase().includes(input.toLowerCase()),
            )
            .slice(0, 5)
            .map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-pill"
                onClick={() => add(s)}
              >
                {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { token, user, api, logout } = useAuth();
  const [form, setForm] = useState({
    formation: "",
    niveau: "",
    competences: [],
    langues: [],
    mobilite: "",
    domaines: [],
  });
  const [status, setStatus] = useState("idle"); // idle | loading | saving | saved | error
  const [msg, setMsg] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    setStatus("loading");
    fetch(`${api}/profile`, { headers })
      .then((r) => {
        if (r.ok) return r.json();
        throw r;
      })
      .then((d) => {
        setForm({
          formation: d.formation || "",
          niveau: d.niveau || "",
          competences: d.competences || [],
          langues: d.langues || [],
          mobilite: d.mobilite || "",
          domaines: d.domaines || [],
        });
        setHasProfile(true);
        setStatus("idle");
      })
      .catch((r) => {
        if (r.status === 404) setStatus("idle");
        else setStatus("error");
      });
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setMsg("");
    try {
      const method = hasProfile ? "PUT" : "POST";
      const r = await fetch(`${api}/profile`, {
        method,
        headers,
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json()).detail || "Erreur");
      setHasProfile(true);
      setStatus("saved");
      setMsg("Profil enregistré !");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setMsg(err.message);
    }
  };

  return (
    <div className="profile-page">
      <main className="profile-main">
        <div className="profile-intro">
          <h1>Mon profil professionnel</h1>
          <p>
            {hasProfile
              ? "Mettez à jour vos informations."
              : "Complétez votre profil pour commencer."}
          </p>
        </div>

        {status === "loading" ? (
          <div className="loader-wrap">
            <span className="loader" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form glass-card">
            <section className="form-section">
              <h2>
                <span className="section-num">01</span> Formation
              </h2>
              <div className="grid-2">
                <div className="field">
                  <label>Intitulé de la formation</label>
                  <input
                    type="text"
                    value={form.formation}
                    onChange={(e) => set("formation")(e.target.value)}
                    placeholder="Ex: Licence Informatique"
                  />
                </div>
                <div className="field">
                  <label>Niveau d'études</label>
                  <select
                    value={form.niveau}
                    onChange={(e) => set("niveau")(e.target.value)}
                  >
                    <option value="">— Sélectionner —</option>
                    {NIVEAUX.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>
                <span className="section-num">02</span> Compétences
              </h2>
              <div className="field">
                <label>Compétences techniques & soft skills</label>
                <TagInput
                  values={form.competences}
                  onChange={set("competences")}
                  placeholder="Tapez et appuyez Entrée…"
                />
              </div>
            </section>

            <section className="form-section">
              <h2>
                <span className="section-num">03</span> Langues
              </h2>
              <div className="field">
                <label>Langues maîtrisées</label>
                <TagInput
                  values={form.langues}
                  onChange={set("langues")}
                  suggestions={LANGUES_SUGGERES}
                  placeholder="Ajouter une langue…"
                />
              </div>
            </section>

            <section className="form-section">
              <h2>
                <span className="section-num">04</span> Mobilité & Domaines
              </h2>
              <div className="grid-2">
                <div className="field">
                  <label>Mobilité</label>
                  <select
                    value={form.mobilite}
                    onChange={(e) => set("mobilite")(e.target.value)}
                  >
                    <option value="">— Sélectionner —</option>
                    {MOBILITE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Domaines d'activité</label>
                  <TagInput
                    values={form.domaines}
                    onChange={set("domaines")}
                    suggestions={DOMAINES_SUGGERES}
                    placeholder="Ajouter un domaine…"
                  />
                </div>
              </div>
            </section>

            {msg && (
              <p className={`msg ${status === "error" ? "error" : "success"}`}>
                {msg}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <span className="spin" />
              ) : status === "saved" ? (
                "✓ Enregistré"
              ) : (
                "Enregistrer le profil"
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

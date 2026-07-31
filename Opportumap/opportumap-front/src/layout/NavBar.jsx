import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../service/AuthContext";

const NAV_LINKS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Recherche d'offres",
    path: "/offres",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];

function Avatar({ email }) {
  const initials = email ? email[0].toUpperCase() : "?";
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #e8ff6b 0%, #a8cc00 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        color: "#0a0a0f",
        fontFamily: "'Syne', sans-serif",
        flexShrink: 0,
        boxShadow: "0 0 0 2px rgba(232,255,107,0.2)",
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-item {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 100px;
          font-size: 14px; font-weight: 400; color: #78716c;
          text-decoration: none; cursor: pointer; border: none;
          background: transparent; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s, background 0.2s; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nav-item:hover { color: #f0ede8; background: rgba(255,255,255,0.05); }
        .nav-item.active {
          color: #e8ff6b; background: rgba(232,255,107,0.08);
          border: 1px solid rgba(232,255,107,0.15);
        }
        .nav-item.active svg { stroke: #e8ff6b; }
        .avatar-btn {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; padding: 4px 14px 4px 4px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .avatar-btn:hover { border-color: rgba(232,255,107,0.25); background: rgba(232,255,107,0.04); }
        .avatar-btn.open { border-color: rgba(232,255,107,0.3); background: rgba(232,255,107,0.05); }
        .dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #13131a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; min-width: 220px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: dropdownIn 0.2s ease both; z-index: 200;
        }
        .dropdown-header {
          padding: 16px 18px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; font-size: 14px; color: #a8a29e;
          cursor: pointer; background: none; border: none; width: 100%;
          text-align: left; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: #f0ede8; }
        .dropdown-item.danger:hover { background: rgba(255,80,80,0.08); color: #ff9090; }
        .dropdown-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }
        .mobile-menu {
          display: none; position: fixed; top: 68px; left: 0; right: 0;
          background: rgba(10,10,15,0.98); border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 12px 20px 20px; flex-direction: column; gap: 4px;
          backdrop-filter: blur(20px); z-index: 99;
        }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 6px; }
        @media (max-width: 680px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex; align-items: center; }
          .mobile-menu { display: flex; }
          .user-email-nav { display: none; }
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5vw",
          background: scrolled ? "rgba(10,10,15,0.9)" : "rgba(10,10,15,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transition: "background 0.3s",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#e8ff6b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#0a0a0f",
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "-0.03em",
              color: "#f0ede8",
            }}
          >
            OpportuMap
          </span>
        </div>

        {/* Nav links */}
        <div
          className="nav-links"
          style={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              className={`nav-item ${isActive(link.path) ? "active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>

        {/* Right — Avatar + dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className={`avatar-btn ${dropdownOpen ? "open" : ""}`}
              onClick={() => setDropdownOpen((o) => !o)}
              aria-label="Menu utilisateur"
            >
              <Avatar email={user?.email} />
              <span
                className="user-email-nav"
                style={{
                  fontSize: 13,
                  color: "#a8a29e",
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#78716c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="dropdown">
                {/* Header */}
                <div className="dropdown-header">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar email={user?.email} />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#f0ede8",
                          marginBottom: 2,
                        }}
                      >
                        Mon compte
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#57534e",
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div style={{ padding: "6px 0" }}>
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.path}
                      className="dropdown-item"
                      onClick={() => {
                        navigate(link.path);
                        setDropdownOpen(false);
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </button>
                  ))}

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Mon profil
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: 68 }} />
    </>
  );
}

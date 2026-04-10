import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";

const NOTIFICATIONS = [
  { title: "New SWIFT message received", time: "2 min ago" },
  { title: "System maintenance scheduled", time: "1 hr ago" },
  { title: "User access updated", time: "3 hrs ago" },
];

function getExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function useSessionCountdown() {
  const [msLeft, setMsLeft] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const expiry = getExpiry(token);
    if (!expiry) return undefined;

    const tick = () => setMsLeft(Math.max(0, expiry - Date.now()));
    tick();

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return msLeft;
}

function getSessionState(msLeft) {
  if (msLeft === null) {
    return {
      tone: "neutral",
      label: "Session unavailable",
      detail: "No active token expiry was found.",
      accentColor: "#94a3b8",
      backgroundColor: "#f8fafc",
    };
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");
  const countdown = hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;

  if (msLeft === 0) {
    return {
      tone: "danger",
      label: "Session expired",
      detail: "Your current login session has expired.",
      value: "Expired",
      accentColor: "#ef4444",
      backgroundColor: "#fef2f2",
    };
  }

  if (msLeft < 60000) {
    return {
      tone: "danger",
      label: "Session expires soon",
      detail: "Less than 1 minute remaining.",
      value: countdown,
      accentColor: "#ef4444",
      backgroundColor: "#fef2f2",
    };
  }

  if (msLeft < 300000) {
    return {
      tone: "warning",
      label: "Session expires soon",
      detail: "Less than 5 minutes remaining.",
      value: countdown,
      accentColor: "#f97316",
      backgroundColor: "#fff7ed",
    };
  }

  if (msLeft < 900000) {
    return {
      tone: "caution",
      label: "Session active",
      detail: "Less than 15 minutes remaining.",
      value: countdown,
      accentColor: "#eab308",
      backgroundColor: "#fefce8",
    };
  }

  return {
    tone: "success",
    label: "Session active",
    detail: "You still have plenty of time left.",
    value: countdown,
    accentColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  };
}

export default function QuickAccessMenu({ onOpenTab }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("session");
  const menuRef = useRef(null);
  const msLeft = useSessionCountdown();
  const notificationCount = NOTIFICATIONS.length;
  const sessionState = getSessionState(msLeft);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="shell-utility" ref={menuRef}>
      <button
        type="button"
        className={`shell-utility-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        title="Quick access"
        aria-label="Open quick access menu"
        aria-expanded={open}
      >
        <span className="shell-utility-trigger-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="11" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        {notificationCount > 0 && <span className="shell-utility-trigger-badge">{notificationCount}</span>}
        <svg className="shell-utility-trigger-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="shell-utility-menu">
          <div className="shell-utility-menu-header">
            <div>
              <p className="shell-utility-menu-title">Quick Access</p>
              <p className="shell-utility-menu-subtitle">Session, notifications, and account</p>
            </div>
          </div>

          <div className="shell-utility-option-list" role="tablist" aria-label="Quick access sections">
            <button
              type="button"
              className={`shell-utility-option ${activeSection === "session" ? "active" : ""}`}
              onClick={() => setActiveSection("session")}
            >
              <span className="shell-utility-option-icon session">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 16 14" />
                </svg>
              </span>
              <span className="shell-utility-option-text">
                <span>Session</span>
                <small>{sessionState.value || sessionState.label}</small>
              </span>
            </button>

            <button
              type="button"
              className={`shell-utility-option ${activeSection === "notifications" ? "active" : ""}`}
              onClick={() => setActiveSection("notifications")}
            >
              <span className="shell-utility-option-icon notifications">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <span className="shell-utility-option-text">
                <span>Notifications</span>
                <small>{notificationCount} unread</small>
              </span>
            </button>

            <button
              type="button"
              className={`shell-utility-option ${activeSection === "account" ? "active" : ""}`}
              onClick={() => setActiveSection("account")}
            >
              <span className="shell-utility-option-icon account">
                <div className="shell-utility-mini-avatar">{initials}</div>
              </span>
              <span className="shell-utility-option-text">
                <span>Account</span>
                <small>{user?.role || "Profile"}</small>
              </span>
            </button>
          </div>

          <div className="shell-utility-panel">
            {activeSection === "session" && (
              <div className="shell-utility-session-plain">
                <div className="shell-utility-section-head compact">
                  <span>Session status</span>
                </div>
                <div className="shell-utility-session-line">
                  <span className="shell-utility-session-key">State</span>
                  <span
                    className="shell-utility-session-chip"
                    style={{ "--utility-session-accent": sessionState.accentColor }}
                  >
                    {sessionState.label}
                  </span>
                </div>
                <div className="shell-utility-session-line">
                  <span className="shell-utility-session-key">Time left</span>
                  <span className="shell-utility-session-inline-value">{sessionState.value || "Unavailable"}</span>
                </div>
                <div className="shell-utility-session-note">{sessionState.detail}</div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="shell-utility-notifications">
                <div className="shell-utility-section-head">
                  <span>Recent notifications</span>
                  <span className="shell-utility-pill">{notificationCount} new</span>
                </div>
                <div className="shell-utility-notification-list">
                  {NOTIFICATIONS.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="shell-utility-notification-item">
                      <span className="shell-utility-notification-dot" />
                      <div>
                        <p>{item.title}</p>
                        <small>{item.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div className="shell-utility-account">
                <div className="shell-utility-account-card">
                  <div className="shell-utility-account-avatar">{initials}</div>
                  <div className="shell-utility-account-meta">
                    <p>{user?.name}</p>
                    <span>{user?.role}</span>
                    <small>{user?.employeeId}</small>
                  </div>
                </div>

                <div className="shell-utility-account-actions">
                  <button
                    type="button"
                    className="shell-utility-action-btn"
                    onClick={() => {
                      setOpen(false);
                      onOpenTab("profile");
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </button>
                  <button
                    type="button"
                    className="shell-utility-action-btn logout"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

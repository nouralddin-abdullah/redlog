/* global React */
const { useState, useEffect, useRef } = React;

/* =========================================================
   Icons — simple, line-style, inherit color via currentColor
   ========================================================= */
const Icon = ({ name, size = 18, className = "", style = {} }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    style,
  };
  switch (name) {
    case "home":     return <svg {...props}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case "book":     return <svg {...props}><path d="M4 4h7a3 3 0 013 3v13"/><path d="M20 4h-7a3 3 0 00-3 3v13"/><path d="M4 4v16h7"/><path d="M20 4v16h-7"/></svg>;
    case "play":     return <svg {...props}><path d="M7 5l12 7-12 7V5z" fill="currentColor"/></svg>;
    case "pause":    return <svg {...props}><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></svg>;
    case "check":    return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case "check-circle": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>;
    case "search":   return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case "bell":     return <svg {...props}><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></svg>;
    case "chat":     return <svg {...props}><path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z"/></svg>;
    case "users":    return <svg {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="17" cy="6" r="3"/><path d="M22 19c0-3-2-5-5-5"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case "logout":   return <svg {...props}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
    case "video":    return <svg {...props}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>;
    case "file":     return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>;
    case "quiz":     return <svg {...props}><path d="M9 11l3 3 4-5"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>;
    case "chevron-down":  return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case "chevron-left":  return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case "plus":     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "send":     return <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>;
    case "clock":    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "star":     return <svg {...props}><path d="M12 2l3 7 7 .8-5 5 1.5 7L12 18l-6.5 3.8L7 14.8 2 9.8 9 9z"/></svg>;
    case "star-filled": return <svg {...props}><path d="M12 2l3 7 7 .8-5 5 1.5 7L12 18l-6.5 3.8L7 14.8 2 9.8 9 9z" fill="currentColor"/></svg>;
    case "fullscreen": return <svg {...props}><path d="M3 9V3h6"/><path d="M21 9V3h-6"/><path d="M3 15v6h6"/><path d="M21 15v6h-6"/></svg>;
    case "volume":   return <svg {...props}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19 12c0-3-2-5-2-5"/><path d="M22 12c0-5-3-8-3-8"/></svg>;
    case "settings-cog": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>;
    case "device-mobile": return <svg {...props}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>;
    case "device-laptop": return <svg {...props}><rect x="3" y="5" width="18" height="11" rx="2"/><path d="M2 19h20"/></svg>;
    case "lock":     return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>;
    case "mail":     return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "user":     return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case "trash":    return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>;
    case "menu":     return <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "x":        return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case "filter":   return <svg {...props}><path d="M3 6h18l-7 9v6l-4-2v-4z"/></svg>;
    case "edit":     return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4z"/></svg>;
    case "image":    return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>;
    case "smile":    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>;
    case "paperclip": return <svg {...props}><path d="M21 12.5l-9 9a5.5 5.5 0 01-8-8l9-9a3.7 3.7 0 015 5L9 18.5a2 2 0 01-3-3l8-8"/></svg>;
    default: return null;
  }
};

/* =========================================================
   Logo — Radlog wordmark in book-and-blue style
   ========================================================= */
const RadlogLogo = ({ size = 32, mono = false }) => {
  const blue = mono ? "currentColor" : "#3B6FA8";
  const dark = mono ? "currentColor" : "#0E2A47";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, direction: "ltr" }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M4 8h14a4 4 0 014 4v22a3 3 0 00-3-3H4V8z" fill={blue} opacity=".15"/>
        <path d="M36 8H22a4 4 0 00-4 4v22a3 3 0 013-3h13V8z" fill={blue} opacity=".25"/>
        <path d="M4 8h14a4 4 0 014 4v22M36 8H22a4 4 0 00-4 4v22" stroke={dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M20 16v8" stroke={blue} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="13" r="2" fill={blue}/>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: size * 0.62,
          fontWeight: 700,
          color: dark,
          letterSpacing: ".02em",
        }}>
          RAD<span style={{ color: blue }}>LOG</span>
        </span>
        {size >= 32 && (
          <span style={{
            fontSize: 9,
            color: "var(--ink-500)",
            letterSpacing: ".15em",
            marginTop: 4,
            textTransform: "uppercase",
            fontFamily: 'var(--font-en)',
          }}>
            Build Your Radiology Experience
          </span>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Avatar — initials based, deterministic color
   ========================================================= */
const AVATAR_COLORS = ["#3B6FA8", "#0E2A47", "#0284C7", "#16A34A", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];
const Avatar = ({ name = "؟", size = 36, src }) => {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const bg = AVATAR_COLORS[colorIdx];
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (src) {
    return <img src={src} alt={name} className="avatar" style={style} />;
  }
  return (
    <span className="avatar" style={{ ...style, background: bg }}>{initials}</span>
  );
};

/* =========================================================
   Topbar — used on all logged-in screens
   ========================================================= */
const Topbar = ({ onNavigate, currentScreen, onLogout, notifications, setNotifications }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="topbar">
      <div className="search-bar">
        <input className="input" placeholder="ابحث عن كورس، محاضر، أو موضوع..." />
        <span className="search-icon"><Icon name="search" size={18} /></span>
      </div>
      <div className="spacer" />

      <div ref={notifRef} style={{ position: "relative" }}>
        <button
          className="btn btn-ghost"
          style={{ padding: 8, position: "relative", border: "none" }}
          onClick={() => setShowNotif(v => !v)}
          aria-label="الإشعارات"
        >
          <Icon name="bell" size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 4, left: 4,
              background: "var(--danger)", color: "#fff",
              fontSize: 10, fontWeight: 700,
              minWidth: 16, height: 16, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
            }}>{unreadCount}</span>
          )}
        </button>
        {showNotif && (
          <div className="dropdown" style={{ left: 0, right: "auto" }}>
            <div className="dropdown-header">
              <span>الإشعارات</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ color: "var(--brand-blue)", fontSize: 13, fontWeight: 600 }}>
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--ink-500)" }}>
                  لا توجد إشعارات
                </div>
              ) : notifications.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className={`notif-dot ${n.read ? "read" : ""}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.read ? 500 : 600, fontSize: 14, color: "var(--ink-800)" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>{n.body}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 4 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={profileRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowProfile(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: 4, borderRadius: 8 }}
        >
          <Avatar name="أحمد محمد" size={36} />
          <div style={{ textAlign: "right", display: window.innerWidth > 600 ? "block" : "none" }}>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>أحمد محمد</div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>طالب أشعة</div>
          </div>
          <Icon name="chevron-down" size={16} style={{ color: "var(--ink-400)" }} />
        </button>
        {showProfile && (
          <div className="dropdown" style={{ left: 0, right: "auto", minWidth: 220 }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 600 }}>أحمد محمد</div>
              <div style={{ fontSize: 13, color: "var(--ink-500)" }}>ahmed@example.com</div>
            </div>
            <div style={{ padding: 6 }}>
              <button className="nav-item" style={{ width: "100%" }} onClick={() => { setShowProfile(false); onNavigate("settings"); }}>
                <Icon name="user" size={18} /> الملف الشخصي
              </button>
              <button className="nav-item" style={{ width: "100%" }} onClick={() => { setShowProfile(false); onNavigate("settings"); }}>
                <Icon name="settings" size={18} /> الإعدادات والأجهزة
              </button>
              <div className="divider" />
              <button className="nav-item" style={{ width: "100%", color: "var(--danger)" }} onClick={onLogout}>
                <Icon name="logout" size={18} /> تسجيل الخروج
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Sidebar — primary nav
   ========================================================= */
const Sidebar = ({ current, onNavigate }) => {
  const items = [
    { key: "dashboard", label: "لوحة التحكم", icon: "home" },
    { key: "browse",    label: "استكشف الكورسات", icon: "book" },
    { key: "my-courses", label: "كورساتي", icon: "play" },
    { key: "chat",      label: "مجتمع الكورسات", icon: "users" },
  ];
  const secondary = [
    { key: "settings",  label: "الإعدادات", icon: "settings" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <RadlogLogo size={28} />
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">القائمة الرئيسية</div>
        {items.map(it => (
          <button
            key={it.key}
            className={`nav-item ${current === it.key || (it.key === "my-courses" && current === "player") ? "active" : ""}`}
            style={{ width: "100%" }}
            onClick={() => onNavigate(it.key)}
          >
            <Icon name={it.icon} size={20} />
            <span>{it.label}</span>
          </button>
        ))}
        <div className="nav-section-label">الحساب</div>
        {secondary.map(it => (
          <button
            key={it.key}
            className={`nav-item ${current === it.key ? "active" : ""}`}
            style={{ width: "100%" }}
            onClick={() => onNavigate(it.key)}
          >
            <Icon name={it.icon} size={20} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{
          background: "var(--brand-blue-50)",
          borderRadius: "var(--r-md)",
          padding: 14,
          fontSize: 13,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--brand-blue-700)" }}>
            هل تحتاج مساعدة؟
          </div>
          <div style={{ color: "var(--ink-600)", lineHeight: 1.5 }}>
            تواصل مع فريق الدعم الفني
          </div>
          <button className="btn btn-soft btn-sm" style={{ marginTop: 10, width: "100%" }}>
            تواصل معنا
          </button>
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { Icon, RadlogLogo, Avatar, Topbar, Sidebar });

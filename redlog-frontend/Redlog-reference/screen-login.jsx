/* global React, Icon, RadlogLogo */
const { useState: useStateAuth } = React;

/* =========================================================
   LOGIN / SIGNUP — entry point
   ========================================================= */
const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useStateAuth("login"); // login | signup
  const [email, setEmail] = useStateAuth("");
  const [password, setPassword] = useStateAuth("");
  const [name, setName] = useStateAuth("");
  const [error, setError] = useStateAuth("");
  const [loading, setLoading] = useStateAuth(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("من فضلك املأ كل الحقول");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 600);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg)",
    }} className="login-shell">
      {/* Left panel — branding */}
      <div style={{
        background: "linear-gradient(160deg, var(--brand-navy) 0%, #15375E 60%, var(--brand-blue-700) 100%)",
        color: "#fff",
        padding: "60px 56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }} className="login-brand-panel">
        {/* Decorative shapes */}
        <div style={{
          position: "absolute",
          top: -80, right: -80,
          width: 320, height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(111,160,209,.25) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: -120, left: -120,
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,111,168,.20) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{ filter: "brightness(1.5)" }}>
            <RadlogLogo size={42} mono />
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{
            fontSize: 40,
            fontWeight: 700,
            margin: "0 0 16px",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            ابنِ خبرتك في الأشعة
            <br />
            خطوة بخطوة.
          </h1>
          <p style={{
            fontSize: 17,
            opacity: 0.85,
            lineHeight: 1.7,
            margin: "0 0 32px",
            maxWidth: 460,
          }}>
            منصة Radlog هي بيتك التعليمي لتعلم الأشعة التشخيصية والعلاجية،
            بمحاضرات مبسطة، اختبارات تفاعلية، ومجتمع نشط من الطلبة والمحاضرين.
          </p>

          <div style={{ display: "flex", gap: 32, fontSize: 14, opacity: 0.9 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>+12</div>
              <div>كورس متخصص</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>+3,500</div>
              <div>طالب نشط</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>4.9★</div>
              <div>تقييم المنصة</div>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", fontSize: 13, opacity: 0.7 }}>
          © 2026 Radlog. جميع الحقوق محفوظة.
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        padding: "60px 56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: 540,
        margin: "0 auto",
        width: "100%",
      }} className="login-form-panel">
        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          margin: "0 0 8px",
          color: "var(--ink-900)",
        }}>
          {mode === "login" ? "أهلاً بعودتك 👋" : "أنشئ حسابك"}
        </h2>
        <p style={{ color: "var(--ink-500)", margin: "0 0 32px", fontSize: 15 }}>
          {mode === "login"
            ? "ادخل لمتابعة كورساتك ومناقشاتك"
            : "ابدأ رحلتك التعليمية في الأشعة اليوم"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", display: "block", marginBottom: 6 }}>
                الاسم الكامل
              </label>
              <div style={{ position: "relative" }}>
                <Icon name="user" size={18} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--ink-400)",
                }} />
                <input
                  className="input"
                  style={{ paddingRight: 42 }}
                  placeholder="مثل: أحمد محمد"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", display: "block", marginBottom: 6 }}>
              البريد الإلكتروني
            </label>
            <div style={{ position: "relative" }}>
              <Icon name="mail" size={18} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                color: "var(--ink-400)",
              }} />
              <input
                className="input"
                type="email"
                style={{ paddingRight: 42 }}
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", display: "block", marginBottom: 6 }}>
              كلمة السر
            </label>
            <div style={{ position: "relative" }}>
              <Icon name="lock" size={18} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                color: "var(--ink-400)",
              }} />
              <input
                className="input"
                type="password"
                style={{ paddingRight: 42 }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-600)" }}>
                <input type="checkbox" defaultChecked /> تذكرني
              </label>
              <button type="button" style={{ color: "var(--brand-blue)", fontWeight: 600 }}>
                نسيت كلمة السر؟
              </button>
            </div>
          )}

          {error && (
            <div style={{
              background: "var(--danger-soft)",
              color: "var(--danger)",
              padding: 10,
              borderRadius: "var(--r-md)",
              fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? "جاري التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "center",
            margin: "8px 0",
            fontSize: 13,
            color: "var(--ink-400)",
          }}>
            <div style={{ height: 1, background: "var(--border)" }} />
            <span>أو</span>
            <div style={{ height: 1, background: "var(--border)" }} />
          </div>

          <button type="button" className="btn btn-ghost btn-lg btn-block">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-2 3.3-4.9 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.5 7.7 23 12 23z"/><path fill="#FBBC04" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.5 2 14.9 1 12 1 7.7 1 3.9 3.5 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
            الدخول بحساب Google
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--ink-600)" }}>
          {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "var(--brand-blue)", fontWeight: 600 }}
          >
            {mode === "login" ? "أنشئ حساباً" : "سجل دخول"}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-shell { grid-template-columns: 1fr !important; }
          .login-brand-panel { padding: 40px 32px !important; min-height: 280px; }
          .login-brand-panel h1 { font-size: 28px !important; }
          .login-form-panel { padding: 40px 28px !important; }
        }
      `}</style>
    </div>
  );
};

window.LoginScreen = LoginScreen;

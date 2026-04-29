/* global React, Icon, Avatar */
const { useState: useStateSettings } = React;

/* =========================================================
   SETTINGS — Device management focused
   ========================================================= */
const SettingsScreen = () => {
  const [devices, setDevices] = useStateSettings([
    { id: 1, name: "MacBook Pro 14\"", type: "laptop", browser: "Chrome 124", location: "القاهرة، مصر", lastActive: "نشط الآن", current: true },
    { id: 2, name: "iPhone 15", type: "mobile", browser: "Safari", location: "القاهرة، مصر", lastActive: "منذ 5 دقائق", current: false },
  ]);

  const removeDevice = (id) => {
    if (confirm("هل تريد فصل هذا الجهاز؟")) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">الإعدادات</h1>
      <p className="page-subtitle">إدارة حسابك وأجهزتك المتصلة</p>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>المعلومات الشخصية</h3>
        <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 20 }}>
          هذه المعلومات تظهر للمحاضرين وزملاء الكورس
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Avatar name="أحمد محمد" size={64} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>أحمد محمد</div>
            <div style={{ fontSize: 13, color: "var(--ink-500)" }}>ahmed@example.com</div>
            <button className="btn btn-soft btn-sm" style={{ marginTop: 8 }}>تغيير الصورة</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", display: "block", marginBottom: 6 }}>الاسم</label>
            <input className="input" defaultValue="أحمد محمد" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", display: "block", marginBottom: 6 }}>البريد الإلكتروني</label>
            <input className="input" defaultValue="ahmed@example.com" />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>الأجهزة المتصلة</h3>
          <span className="badge badge-blue">{devices.length} / 2</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 20 }}>
          يمكنك تسجيل الدخول من جهازين فقط في نفس الوقت لحماية حسابك
        </div>

        <div style={{
          background: "var(--brand-blue-50)",
          padding: "12px 16px",
          borderRadius: "var(--r-md)",
          fontSize: 13,
          color: "var(--ink-700)",
          marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <Icon name="lock" size={18} style={{ color: "var(--brand-blue)", flexShrink: 0, marginTop: 2 }} />
          <div>إذا حاولت الدخول من جهاز ثالث، سيتم سؤالك عن أي جهاز تريد فصله. يمكنك إدارة أجهزتك بنفسك من هنا.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {devices.map(d => (
            <div key={d.id} style={{
              padding: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              display: "flex", alignItems: "center", gap: 14,
              background: d.current ? "var(--brand-blue-50)" : "var(--bg)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "var(--bg-muted)", color: "var(--ink-700)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={d.type === "laptop" ? "device-laptop" : "device-mobile"} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</span>
                  {d.current && <span className="badge badge-green">هذا الجهاز</span>}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>
                  {d.browser} · {d.location}
                </div>
                <div style={{ fontSize: 12, color: d.current ? "var(--success)" : "var(--ink-400)", marginTop: 2 }}>
                  {d.lastActive}
                </div>
              </div>
              {!d.current && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                  onClick={() => removeDevice(d.id)}
                >
                  <Icon name="logout" size={14} /> فصل الجهاز
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.SettingsScreen = SettingsScreen;

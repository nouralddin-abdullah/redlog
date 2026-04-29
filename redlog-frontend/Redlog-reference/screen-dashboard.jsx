/* global React, Icon, Avatar */
const { useState: useStateDash } = React;

/* =========================================================
   COURSE CARD — used in dashboard & browse
   ========================================================= */
const CourseCard = ({ course, onClick, showProgress = true }) => (
  <div
    className="card"
    onClick={onClick}
    style={{
      cursor: "pointer",
      overflow: "hidden",
      transition: "transform .15s ease, box-shadow .15s ease",
      display: "flex",
      flexDirection: "column",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    <div style={{
      height: 140,
      background: course.cover || `linear-gradient(135deg, ${course.color || "#3B6FA8"} 0%, ${course.color2 || "#0E2A47"} 100%)`,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 32,
      fontWeight: 700,
    }}>
      <span style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        opacity: 0.95,
      }}>{course.short || course.title.slice(0, 2)}</span>
      {course.badge && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,.92)", color: "var(--brand-blue-700)",
          fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 999,
        }}>{course.badge}</span>
      )}
    </div>
    <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 600, marginBottom: 4 }}>
        {course.category}
      </div>
      <h3 style={{
        margin: "0 0 8px",
        fontSize: 16,
        fontWeight: 700,
        color: "var(--ink-900)",
        lineHeight: 1.4,
      }}>{course.title}</h3>
      <div style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 12 }}>
        {course.instructor}
      </div>
      {showProgress && course.progress !== undefined ? (
        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "var(--ink-600)", fontWeight: 600 }}>{course.progress}% مكتمل</span>
            <span style={{ color: "var(--ink-500)" }}>{course.completedLessons}/{course.totalLessons}</span>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <Icon name="star-filled" size={14} style={{ color: "#F59E0B" }} />
            <span style={{ fontWeight: 600 }}>{course.rating}</span>
            <span style={{ color: "var(--ink-400)" }}>({course.students})</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
            <Icon name="clock" size={13} style={{ verticalAlign: "middle", marginLeft: 4 }} />
            {course.duration}
          </div>
        </div>
      )}
    </div>
  </div>
);

/* =========================================================
   STUDENT DASHBOARD
   ========================================================= */
const DashboardScreen = ({ onOpenCourse, onNavigate, courses }) => {
  const enrolled = courses.filter(c => c.progress !== undefined);
  const stats = [
    { label: "كورسات نشطة", value: enrolled.length, icon: "book", color: "#3B6FA8" },
    { label: "ساعات تعلم", value: "47", icon: "clock", color: "#16A34A" },
    { label: "اختبارات", value: "23", icon: "quiz", color: "#D97706" },
    { label: "شهادات", value: "2", icon: "star", color: "#7C3AED" },
  ];

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">أهلاً، أحمد 👋</h1>
          <p className="page-subtitle">تابع رحلتك التعليمية، يومك متبقي فيه درسين لإكمال هدفك الأسبوعي.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("browse")}>
          <Icon name="plus" size={16} /> استكشف كورسات جديدة
        </button>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${s.color}15`, color: s.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <Icon name={s.icon} size={22} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink-900)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>تابع ما توقفت عنده</h2>
          <button onClick={() => onNavigate("my-courses")} style={{ color: "var(--brand-blue)", fontWeight: 600, fontSize: 14 }}>
            عرض الكل ←
          </button>
        </div>

        {enrolled[0] && (
          <div className="card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "260px 1fr", marginBottom: 16 }}>
            <div style={{
              background: `linear-gradient(135deg, ${enrolled[0].color} 0%, ${enrolled[0].color2} 100%)`,
              color: "#fff",
              padding: 24,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 36,
                fontWeight: 700,
              }}>{enrolled[0].short}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{enrolled[0].category}</div>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 6 }}>
                الدرس التالي · الوحدة الثالثة
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 700 }}>{enrolled[0].title}</h3>
              <div style={{ fontSize: 14, color: "var(--ink-600)", marginBottom: 16 }}>
                {enrolled[0].nextLesson || "تشخيص حالات الكسور المعقدة بالأشعة"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>تقدمك</span>
                    <span>{enrolled[0].progress}%</span>
                  </div>
                  <div className="progress"><div className="progress-fill" style={{ width: `${enrolled[0].progress}%` }} /></div>
                </div>
                <button className="btn btn-primary" onClick={() => onOpenCourse(enrolled[0])}>
                  <Icon name="play" size={14} /> استكمل الآن
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {enrolled.slice(1).map(c => (
            <CourseCard key={c.id} course={c} onClick={() => onOpenCourse(c)} />
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }} className="dash-bottom">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>نشاطك في آخر ٧ أيام</h3>
          <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
            معدل تعلمك في تحسن مستمر 📈
          </div>
          {/* Activity data */}
          {(() => {
            const data = [
              { day: "السبت",  mins: 35, lessons: 2 },
              { day: "الأحد",   mins: 58, lessons: 3 },
              { day: "الإثنين", mins: 22, lessons: 1 },
              { day: "الثلاثاء", mins: 72, lessons: 4 },
              { day: "الأربعاء", mins: 48, lessons: 2 },
              { day: "الخميس", mins: 85, lessons: 5 },
              { day: "الجمعة", mins: 60, lessons: 3 },
            ];
            const max = Math.max(...data.map(d => d.mins));
            return (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, height: 220, marginTop: 24, padding: "0 4px" }}>
                {data.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", height: "100%", justifyContent: "flex-end" }}
                    onMouseEnter={e => e.currentTarget.querySelector('.bar-tip').style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.querySelector('.bar-tip').style.opacity = 0}
                  >
                    <div className="bar-tip" style={{
                      position: "absolute", bottom: "calc(100% + 4px)",
                      background: "var(--ink-900)", color: "#fff",
                      padding: "6px 10px", borderRadius: 6,
                      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                      opacity: 0, transition: "opacity .15s", pointerEvents: "none", zIndex: 5,
                    }}>
                      {d.mins} دقيقة · {d.lessons} دروس
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-700)" }}>{d.mins}د</div>
                    <div style={{
                      width: "100%",
                      maxWidth: 56,
                      height: `${(d.mins / max) * 160}px`,
                      background: i === 6
                        ? "linear-gradient(180deg, var(--brand-blue) 0%, var(--brand-blue-700) 100%)"
                        : "linear-gradient(180deg, var(--brand-blue-100) 0%, #b8d4ed 100%)",
                      borderRadius: "8px 8px 4px 4px",
                      transition: "height .3s",
                      cursor: "pointer",
                      boxShadow: i === 6 ? "0 4px 12px rgba(59,111,168,.25)" : "none",
                    }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-600)" }}>{d.day}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>بثوث مباشرة قادمة</h3>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "var(--danger)",
              boxShadow: "0 0 0 4px rgba(220,38,38,.2)",
              animation: "livepulse 1.5s ease-in-out infinite",
            }} />
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 16 }}>
            ٣ بثوث مباشرة هذا الأسبوع
          </div>
          {[
            { title: "مناقشة حالات أشعة الصدر", instructor: "د. سامي حسن", date: "اليوم · 8:00م", live: true },
            { title: "ورشة تطبيقية على CT Abdomen", instructor: "د. أمل السيد", date: "غداً · 7:30م" },
            { title: "Q&A مفتوح للأسئلة", instructor: "د. منى فاروق", date: "الخميس · 9:00م" },
          ].map((q, i) => (
            <div key={i} style={{
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: q.live ? "var(--danger-soft)" : "var(--brand-blue-100)",
                color: q.live ? "var(--danger)" : "var(--brand-blue-700)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <Icon name="video" size={18} />
                {q.live && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", border: "2px solid var(--bg)" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {q.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{q.instructor}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: q.live ? "var(--danger)" : "var(--brand-blue)" }}>{q.date}</div>
                {q.live && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--danger)", marginTop: 2 }}>● مباشر الآن</div>}
              </div>
            </div>
          ))}
          <style>{`@keyframes livepulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }`}</style>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-bottom { grid-template-columns: 1fr !important; }
          .card[style*="grid-template-columns: 260px 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* =========================================================
   BROWSE — Course catalog
   ========================================================= */
const BrowseScreen = ({ courses, onOpenCourse }) => {
  const [filter, setFilter] = useStateDash("الكل");
  const cats = ["الكل", "أشعة تشخيصية", "أشعة علاجية", "MRI", "CT Scan", "أساسيات"];

  const filtered = filter === "الكل" ? courses : courses.filter(c => c.category === filter);

  return (
    <div className="page">
      <h1 className="page-title">استكشف الكورسات</h1>
      <p className="page-subtitle">اكتشف كورسات جديدة من نخبة المحاضرين في تخصصات الأشعة المختلفة</p>

      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24,
        padding: 4, background: "var(--bg)", borderRadius: "var(--r-md)",
        border: "1px solid var(--border)", width: "fit-content",
      }}>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              background: filter === c ? "var(--brand-blue)" : "transparent",
              color: filter === c ? "#fff" : "var(--ink-600)",
              transition: "all .15s",
            }}
          >{c}</button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
      }}>
        {filtered.map(c => (
          <CourseCard key={c.id} course={c} onClick={() => onOpenCourse(c)} showProgress={false} />
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   MY COURSES — list view
   ========================================================= */
const MyCoursesScreen = ({ courses, onOpenCourse }) => {
  const enrolled = courses.filter(c => c.progress !== undefined);
  return (
    <div className="page">
      <h1 className="page-title">كورساتي</h1>
      <p className="page-subtitle">{enrolled.length} كورسات مسجل فيها</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
      }}>
        {enrolled.map(c => (
          <CourseCard key={c.id} course={c} onClick={() => onOpenCourse(c)} />
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { CourseCard, DashboardScreen, BrowseScreen, MyCoursesScreen });

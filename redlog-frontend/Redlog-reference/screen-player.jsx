/* global React, Icon, Avatar */
const { useState: useStatePlayer, useEffect: useEffectPlayer, useRef: useRefPlayer } = React;

/* =========================================================
   COURSE PLAYER — heart of the platform
   ========================================================= */
const CoursePlayer = ({ course, onBack, onOpenQuiz }) => {
  const [activeTab, setActiveTab] = useStatePlayer("notes");
  const [playing, setPlaying] = useStatePlayer(false);
  const [progress, setProgress] = useStatePlayer(34); // %
  const [currentTime, setCurrentTime] = useStatePlayer(312); // seconds
  const totalDuration = 920;
  const [openModule, setOpenModule] = useStatePlayer(0);
  const [currentLessonId, setCurrentLessonId] = useStatePlayer("l1-2");
  const [notes, setNotes] = useStatePlayer([
    { id: 1, time: 145, text: "نقطة مهمة: الفرق بين CT وMRI في تشخيص الكسور" },
    { id: 2, time: 248, text: "مراجعة: زاوية الميل في صور الصدر الأمامية" },
  ]);
  const [newNote, setNewNote] = useStatePlayer("");
  const [questions, setQuestions] = useStatePlayer([
    { id: 1, user: "سارة علي", time: "منذ ساعتين", text: "ما الفرق بين الـ X-ray والـ CT scan في تشخيص الالتهاب الرئوي؟", replies: 3, likes: 12 },
    { id: 2, user: "محمد خالد", time: "منذ ٤ ساعات", text: "هل يمكن استخدام الموجات فوق الصوتية بديلاً عن الأشعة المقطعية للأطفال؟", replies: 5, likes: 8 },
    { id: 3, user: "ليلى أحمد", time: "أمس", text: "أحتاج توضيح أكثر للنقطة في الدقيقة 12:30، هل يمكن إضافة شرح إضافي؟", replies: 2, likes: 4 },
  ]);
  const [newQuestion, setNewQuestion] = useStatePlayer("");
  const [watermarkPos, setWatermarkPos] = useStatePlayer({ top: "20%", left: "15%" });

  // Watermark random movement
  useEffectPlayer(() => {
    const interval = setInterval(() => {
      const positions = [
        { top: "15%", left: "10%" },
        { top: "70%", left: "75%" },
        { top: "20%", left: "70%" },
        { top: "75%", left: "15%" },
        { top: "45%", left: "45%" },
      ];
      setWatermarkPos(positions[Math.floor(Math.random() * positions.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulated playback
  useEffectPlayer(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCurrentTime(c => {
        const next = c + 1;
        setProgress((next / totalDuration) * 100);
        if (next >= totalDuration) { setPlaying(false); return totalDuration; }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const modules = course.modules || [
    {
      title: "الوحدة الأولى: مقدمة وأساسيات",
      duration: "1س 20د",
      lessons: [
        { id: "l1-1", title: "تعريف بعلم الأشعة وتطبيقاته", type: "video", duration: "12:30", completed: true },
        { id: "l1-2", title: "أنواع الأشعة الطبية المستخدمة", type: "video", duration: "15:20", completed: false, current: true },
        { id: "l1-3", title: "ملف PDF: المصطلحات الأساسية", type: "file", duration: "8 صفحات", completed: false },
        { id: "l1-4", title: "اختبار الوحدة الأولى", type: "quiz", duration: "10 أسئلة", completed: false },
      ],
    },
    {
      title: "الوحدة الثانية: قراءة صور الأشعة السينية",
      duration: "2س 45د",
      lessons: [
        { id: "l2-1", title: "أساسيات قراءة الـ X-ray", type: "video", duration: "18:40", completed: false },
        { id: "l2-2", title: "صور الصدر: الحالات الطبيعية", type: "video", duration: "22:10", completed: false },
        { id: "l2-3", title: "صور الصدر: الحالات المرضية", type: "video", duration: "25:30", completed: false },
        { id: "l2-4", title: "ملف: حالات للتدريب", type: "file", duration: "PDF", completed: false },
      ],
    },
    {
      title: "الوحدة الثالثة: الأشعة المقطعية CT",
      duration: "3س 10د",
      lessons: [
        { id: "l3-1", title: "مبدأ عمل الـ CT Scanner", type: "video", duration: "20:00", completed: false },
        { id: "l3-2", title: "تشخيص أمراض البطن بالـ CT", type: "video", duration: "28:50", completed: false },
        { id: "l3-3", title: "اختبار شامل للوحدة", type: "quiz", duration: "15 سؤال", completed: false },
      ],
    },
  ];

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: Date.now(), time: currentTime, text: newNote.trim() }]);
    setNewNote("");
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([{ id: Date.now(), user: "أحمد محمد", time: "الآن", text: newQuestion.trim(), replies: 0, likes: 0 }, ...questions]);
    setNewQuestion("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-soft)",
      display: "grid",
      gridTemplateColumns: "1fr 360px",
    }} className="player-shell">
      {/* MAIN COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mini topbar */}
        <div style={{
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <Icon name="chevron-right" size={16} /> العودة
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{course.category}</div>
            <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {course.title}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-600)" }}>
            <div className="progress" style={{ width: 120 }}>
              <div className="progress-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <span>{course.progress}%</span>
          </div>
        </div>

        {/* Video player */}
        <div style={{
          background: "#000",
          aspectRatio: "16/9",
          position: "relative",
          maxHeight: "65vh",
          overflow: "hidden",
        }}>
          {/* Animated watermark */}
          <div style={{
            position: "absolute",
            top: watermarkPos.top,
            left: watermarkPos.left,
            color: "rgba(255,255,255,.30)",
            fontSize: 14,
            fontWeight: 600,
            pointerEvents: "none",
            transition: "all 1.5s ease",
            zIndex: 5,
            background: "rgba(0,0,0,.20)",
            padding: "4px 10px",
            borderRadius: 4,
            backdropFilter: "blur(2px)",
          }}>
            أحمد محمد · ahmed@radlog
          </div>

          {/* Mock video content */}
          <div style={{
            width: "100%", height: "100%",
            background: "radial-gradient(circle at center, #1a3a5c 0%, #0a1a2e 80%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,.4)",
            fontSize: 18,
            position: "relative",
          }}>
            {/* Fake X-ray-ish illustration */}
            <svg width="280" height="280" viewBox="0 0 200 200" style={{ opacity: 0.15 }}>
              <ellipse cx="100" cy="80" rx="50" ry="30" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M100 110 Q70 130 60 170 M100 110 Q130 130 140 170" stroke="white" strokeWidth="1.5" fill="none"/>
              <line x1="100" y1="50" x2="100" y2="170" stroke="white" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx="80" cy="75" r="3" fill="white"/>
              <circle cx="120" cy="75" r="3" fill="white"/>
            </svg>
            <button
              onClick={() => setPlaying(!playing)}
              style={{
                position: "absolute",
                width: 80, height: 80,
                borderRadius: "50%",
                background: "rgba(59,111,168,.95)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,.4)",
                opacity: playing ? 0 : 1,
                transition: "opacity .2s",
              }}
            >
              <Icon name={playing ? "pause" : "play"} size={32} />
            </button>
          </div>

          {/* Controls */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,0) 100%)",
            padding: "32px 20px 16px",
            color: "#fff",
            direction: "ltr",
          }}>
            {/* Progress bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.floor(pct * totalDuration));
                setProgress(pct * 100);
              }}
              style={{
                height: 4,
                background: "rgba(255,255,255,.25)",
                borderRadius: 999,
                cursor: "pointer",
                marginBottom: 12,
                position: "relative",
              }}
            >
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "var(--brand-blue)",
                borderRadius: 999,
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  right: -6, top: "50%",
                  transform: "translateY(-50%)",
                  width: 12, height: 12,
                  borderRadius: "50%",
                  background: "#fff",
                }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
              <button onClick={() => setPlaying(!playing)} style={{ color: "#fff" }}>
                <Icon name={playing ? "pause" : "play"} size={20} />
              </button>
              <Icon name="volume" size={18} />
              <span style={{ fontFamily: "monospace" }}>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
              <div style={{ flex: 1 }} />
              <button style={{ color: "#fff", fontSize: 13, padding: "4px 10px", border: "1px solid rgba(255,255,255,.3)", borderRadius: 4 }}>
                1.0x
              </button>
              <button style={{ color: "#fff", fontSize: 13, padding: "4px 10px", border: "1px solid rgba(255,255,255,.3)", borderRadius: 4 }}>
                HD
              </button>
              <Icon name="settings-cog" size={18} />
              <Icon name="fullscreen" size={18} />
            </div>
          </div>
        </div>

        {/* Lesson info */}
        <div style={{ padding: "20px 24px 12px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
            أنواع الأشعة الطبية المستخدمة
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--ink-500)" }}>
            <span>الوحدة الأولى · الدرس الثاني</span>
            <span>•</span>
            <span>{course.instructor}</span>
            <span>•</span>
            <span>15:20 دقيقة</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex", gap: 4,
          background: "var(--bg)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          {[
            { key: "notes", label: "الملاحظات", icon: "edit", count: notes.length },
            { key: "qa", label: "الأسئلة والمناقشات", icon: "chat", count: questions.length },
            { key: "files", label: "المرفقات", icon: "paperclip", count: 4 },
            { key: "transcript", label: "النص المكتوب", icon: "file" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "14px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === t.key ? "var(--brand-blue)" : "var(--ink-600)",
                borderBottom: `2px solid ${activeTab === t.key ? "var(--brand-blue)" : "transparent"}`,
                marginBottom: -1,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: activeTab === t.key ? "var(--brand-blue-100)" : "var(--bg-muted)",
                  color: activeTab === t.key ? "var(--brand-blue-700)" : "var(--ink-500)",
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 8px", borderRadius: 999,
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: 24, background: "var(--bg)", flex: 1 }}>
          {activeTab === "notes" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
                <textarea
                  className="textarea"
                  placeholder="اكتب ملاحظتك هنا..."
                  rows={2}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  style={{ resize: "none" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn btn-soft btn-sm" onClick={() => setNewNote(n => n + ` [${formatTime(currentTime)}] `)}>
                    <Icon name="clock" size={14} /> إضافة طابع زمني
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={addNote}>
                    حفظ الملاحظة
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {notes.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--ink-500)" }}>
                    لا توجد ملاحظات بعد. ابدأ بكتابة ملاحظتك الأولى!
                  </div>
                )}
                {notes.map(n => (
                  <div key={n.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <button
                      onClick={() => { setCurrentTime(n.time); setProgress((n.time / totalDuration) * 100); }}
                      style={{
                        background: "var(--brand-blue-100)",
                        color: "var(--brand-blue-700)",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >{formatTime(n.time)}</button>
                    <div style={{ flex: 1, fontSize: 14, color: "var(--ink-800)" }}>{n.text}</div>
                    <button onClick={() => setNotes(notes.filter(x => x.id !== n.id))} style={{ color: "var(--ink-400)" }}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "qa" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
                <Avatar name="أحمد محمد" size={36} />
                <textarea
                  className="textarea"
                  placeholder="اطرح سؤالاً يراه المحاضر وباقي الطلاب..."
                  rows={2}
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  style={{ resize: "none", flex: 1 }}
                />
                <button className="btn btn-primary" onClick={addQuestion}>
                  نشر السؤال
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {questions.map(q => (
                  <div key={q.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Avatar name={q.user} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{q.user}</span>
                          <span style={{ fontSize: 12, color: "var(--ink-500)" }}>· {q.time}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 14, color: "var(--ink-800)", lineHeight: 1.6 }}>
                          {q.text}
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13, color: "var(--ink-500)" }}>
                          <button style={{ color: "var(--ink-600)", fontWeight: 500 }}>👍 {q.likes}</button>
                          <button style={{ color: "var(--brand-blue)", fontWeight: 600 }}>
                            <Icon name="chat" size={14} style={{ verticalAlign: "middle", marginLeft: 4 }} />
                            {q.replies} رد
                          </button>
                          <button style={{ color: "var(--ink-600)" }}>الرد</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {[
                { name: "صور أشعة الصدر للحالات الطبيعية", size: "2.4 MB", type: "PDF" },
                { name: "X-rays - حالات للتدريب", size: "8.1 MB", type: "ZIP" },
                { name: "ملخص الدرس", size: "450 KB", type: "PDF" },
                { name: "صور توضيحية إضافية", size: "5.2 MB", type: "PNG" },
              ].map((f, i) => (
                <div key={i} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 8,
                    background: "var(--brand-blue-100)", color: "var(--brand-blue-700)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                  }}>{f.type}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{f.size}</div>
                  </div>
                  <button className="btn btn-soft btn-sm">تنزيل</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "transcript" && (
            <div style={{ maxWidth: 720, lineHeight: 1.9, fontSize: 15, color: "var(--ink-700)" }}>
              <p>في هذا الدرس، سنتعرف على أنواع الأشعة الطبية المستخدمة في المجال التشخيصي والعلاجي...</p>
              <p style={{ marginTop: 16 }}>الأشعة السينية (X-rays) تعتبر من أقدم أنواع التصوير الطبي وأكثرها شيوعاً، وتستخدم بشكل أساسي في تشخيص...</p>
              <p style={{ marginTop: 16 }}>أما الأشعة المقطعية (CT Scan)، فهي تتميز بقدرتها على إنتاج صور مقطعية ثلاثية الأبعاد لأعضاء الجسم...</p>
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR — course outline */}
      <aside className="player-sidebar" style={{
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}>
        <div style={{ padding: 18, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>محتوى الكورس</h3>
          <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
            {modules.length} وحدات · {modules.reduce((a, m) => a + m.lessons.length, 0)} درس
          </div>
        </div>

        {modules.map((mod, mi) => (
          <div key={mi} style={{ borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => setOpenModule(openModule === mi ? -1 : mi)}
              style={{
                width: "100%",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "right",
                background: openModule === mi ? "var(--bg-soft)" : "transparent",
              }}
            >
              <Icon name={openModule === mi ? "chevron-down" : "chevron-left"} size={16} style={{ color: "var(--ink-400)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{mod.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                  {mod.lessons.length} دروس · {mod.duration}
                </div>
              </div>
            </button>
            {openModule === mi && (
              <div>
                {mod.lessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setCurrentLessonId(l.id);
                      if (l.type === "quiz") onOpenQuiz();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 18px 10px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "right",
                      background: currentLessonId === l.id ? "var(--brand-blue-50)" : "transparent",
                      borderRight: currentLessonId === l.id ? "3px solid var(--brand-blue)" : "3px solid transparent",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: l.completed ? "var(--success-soft)" : "var(--bg-muted)",
                      color: l.completed ? "var(--success)" : "var(--ink-500)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon name={l.completed ? "check" : l.type === "video" ? "play" : l.type === "quiz" ? "quiz" : "file"} size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: currentLessonId === l.id ? 600 : 500,
                        color: currentLessonId === l.id ? "var(--brand-blue-700)" : "var(--ink-700)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>
                        {l.duration}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      <style>{`
        @media (max-width: 1100px) {
          .player-shell { grid-template-columns: 1fr !important; }
          .player-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
};

window.CoursePlayer = CoursePlayer;

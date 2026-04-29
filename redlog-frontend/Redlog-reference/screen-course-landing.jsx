/* global React, Icon, Avatar */
const { useState: useStateLanding } = React;

/* =========================================================
   COURSE LANDING — for not-yet-enrolled users
   ========================================================= */
const CourseLandingScreen = ({ course, onBack, onEnroll }) => {
  const [activeTab, setActiveTab] = useStateLanding("overview");
  const [openModule, setOpenModule] = useStateLanding(0);

  const modules = [
    {
      title: "الوحدة الأولى: مقدمة وأساسيات",
      duration: "1س 20د",
      lessons: [
        { title: "تعريف بعلم الأشعة وتطبيقاته", type: "video", duration: "12:30", preview: true },
        { title: "أنواع الأشعة الطبية المستخدمة", type: "video", duration: "15:20", preview: true },
        { title: "ملف PDF: المصطلحات الأساسية", type: "file", duration: "8 صفحات" },
        { title: "اختبار الوحدة الأولى", type: "quiz", duration: "10 أسئلة" },
      ],
    },
    {
      title: "الوحدة الثانية: قراءة صور الأشعة السينية",
      duration: "2س 45د",
      lessons: [
        { title: "أساسيات قراءة الـ X-ray", type: "video", duration: "18:40" },
        { title: "صور الصدر: الحالات الطبيعية", type: "video", duration: "22:10" },
        { title: "صور الصدر: الحالات المرضية", type: "video", duration: "25:30" },
        { title: "ملف: حالات للتدريب", type: "file", duration: "PDF" },
      ],
    },
    {
      title: "الوحدة الثالثة: الأشعة المقطعية CT",
      duration: "3س 10د",
      lessons: [
        { title: "مبدأ عمل الـ CT Scanner", type: "video", duration: "20:00" },
        { title: "تشخيص أمراض البطن بالـ CT", type: "video", duration: "28:50" },
        { title: "اختبار شامل للوحدة", type: "quiz", duration: "15 سؤال" },
      ],
    },
    {
      title: "الوحدة الرابعة: حالات تطبيقية عملية",
      duration: "2س 30د",
      lessons: [
        { title: "تحليل حالة: التهاب رئوي", type: "video", duration: "16:20" },
        { title: "تحليل حالة: كسور معقدة", type: "video", duration: "19:00" },
        { title: "اختبار نهائي شامل", type: "quiz", duration: "30 سؤال" },
      ],
    },
  ];

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

  const learnings = [
    "قراءة صور الأشعة السينية للصدر والبطن باحترافية",
    "التمييز بين الحالات الطبيعية والمرضية في الصور المختلفة",
    "فهم الفرق بين CT و MRI و X-ray ومتى نستخدم كل نوع",
    "تحليل أكثر من ٥٠ حالة عملية مع شرح تفصيلي لكل منها",
    "التعامل الآمن مع الجرعات الإشعاعية والصبغات",
    "الاستعداد لامتحانات الزمالة والامتحانات العملية",
  ];

  const reviews = [
    { user: "سارة علي", rating: 5, time: "منذ أسبوع", text: "أفضل كورس درسته في الأشعة، الشرح واضح جداً والمحاضر بيوصل المعلومة ببساطة. الحالات العملية ممتازة وزودتني خبرة كبيرة." },
    { user: "محمد خالد", rating: 5, time: "منذ أسبوعين", text: "الكورس ده غير حياتي العملية. المحتوى منظم بشكل ممتاز، والاختبارات بعد كل وحدة بتثبت المعلومة. أنصح بيه أي طالب أشعة." },
    { user: "ليلى أحمد", rating: 4, time: "منذ شهر", text: "محتوى قوي جداً، بس كنت أتمنى يكون فيه شرح أكثر للأشعة المقطعية المتقدمة. عموماً أداء ممتاز ويستحق التجربة." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${course.color2 || "#0E2A47"} 0%, ${course.color || "#3B6FA8"} 100%)`,
        color: "#fff",
        padding: "20px 32px 60px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 360, height: 360, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ position: "absolute", bottom: -120, right: 100, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

        <button
          onClick={onBack}
          style={{ color: "#fff", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, opacity: 0.8, marginBottom: 24, position: "relative" }}
        >
          <Icon name="chevron-right" size={16} /> العودة للكورسات
        </button>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 40,
          alignItems: "start",
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
        }} className="landing-hero">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                background: "rgba(255,255,255,.18)",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: "blur(6px)",
              }}>{course.category}</span>
              {course.badge && (
                <span style={{
                  background: "#FCD34D",
                  color: "#78350F",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}>{course.badge}</span>
              )}
            </div>

            <h1 style={{
              fontSize: 38,
              fontWeight: 800,
              margin: "0 0 14px",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}>{course.title}</h1>

            <p style={{ fontSize: 17, opacity: 0.92, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 640 }}>
              كورس شامل ومتكامل لتعلم {course.category} من البداية حتى الاحتراف، مع حالات عملية حقيقية،
              اختبارات تفاعلية، ومجتمع نشط من الطلبة والمحاضرين.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="star-filled" size={16} style={{ color: "#FCD34D" }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{course.rating || 4.8}</span>
                <span style={{ opacity: 0.8 }}>({course.students || "1,200"} تقييم)</span>
              </div>
              <div style={{ opacity: 0.4 }}>•</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="users" size={16} />
                <span>{course.students || "1,200"} طالب مسجل</span>
              </div>
              <div style={{ opacity: 0.4 }}>•</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="clock" size={16} />
                <span>{course.duration || "8 ساعات"}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={course.instructor || "د. سامي حسن"} size={44} />
              <div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>المحاضر</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{course.instructor || "د. سامي حسن"}</div>
              </div>
            </div>
          </div>

          {/* Floating preview card */}
          <div style={{
            background: "var(--bg)",
            color: "var(--ink-800)",
            borderRadius: "var(--r-lg)",
            boxShadow: "0 20px 50px rgba(0,0,0,.25)",
            overflow: "hidden",
            position: "sticky",
            top: 20,
          }} className="landing-card">
            {/* Preview thumbnail */}
            <div style={{
              aspectRatio: "16/9",
              background: `linear-gradient(135deg, ${course.color} 0%, ${course.color2} 100%)`,
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(255,255,255,.95)",
                color: course.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,.2)",
              }}>
                <Icon name="play" size={28} />
              </div>
              <div style={{
                position: "absolute", bottom: 12, right: 12,
                background: "rgba(0,0,0,.6)", color: "#fff",
                padding: "4px 10px", borderRadius: 4,
                fontSize: 12, fontWeight: 600,
              }}>معاينة مجانية · 2:34</div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "var(--ink-900)" }}>499 ج.م</span>
                <span style={{ fontSize: 16, color: "var(--ink-400)", textDecoration: "line-through" }}>799 ج.م</span>
                <span className="badge badge-green" style={{ marginRight: "auto" }}>خصم 38%</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginBottom: 16 }}>
                ⏱ ينتهي العرض خلال يومين
              </div>

              <button className="btn btn-primary btn-lg btn-block" onClick={onEnroll} style={{ marginBottom: 8 }}>
                اشترك في الكورس
              </button>
              <button className="btn btn-ghost btn-lg btn-block" style={{ marginBottom: 16 }}>
                <Icon name="play" size={16} /> معاينة مجانية
              </button>

              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)", marginBottom: 10 }}>هذا الكورس يشمل:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--ink-700)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="video" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>{totalLessons - 5} درس فيديو ({course.duration || "8 ساعات"})</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="file" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>12 ملف PDF قابل للتنزيل</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="quiz" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>5 اختبارات تفاعلية</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="chat" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>الدخول لمجتمع الكورس</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="check-circle" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>شهادة إتمام معتمدة</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon name="clock" size={16} style={{ color: "var(--brand-blue)" }} />
                  <span>وصول مدى الحياة</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 14, fontSize: 12, color: "var(--ink-500)", textAlign: "center" }}>
                ضمان استرداد المبلغ خلال ٧ أيام
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", gap: 4 }}>
          {[
            { key: "overview", label: "نظرة عامة" },
            { key: "curriculum", label: "محتوى الكورس" },
            { key: "instructor", label: "عن المحاضر" },
            { key: "reviews", label: "التقييمات" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "16px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === t.key ? "var(--brand-blue)" : "var(--ink-600)",
                borderBottom: `3px solid ${activeTab === t.key ? "var(--brand-blue)" : "transparent"}`,
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 40 }} className="landing-content">
        <div style={{ minWidth: 0 }}>
          {activeTab === "overview" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 16px" }}>ماذا ستتعلم في هذا الكورس؟</h2>
              <div style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)",
                padding: 24,
                marginBottom: 32,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }} className="learnings-grid">
                {learnings.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.6 }}>
                    <Icon name="check" size={18} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                    <span>{l}</span>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>المتطلبات الأساسية</h2>
              <ul style={{ paddingRight: 20, margin: "0 0 32px", color: "var(--ink-700)", lineHeight: 1.9 }}>
                <li>خلفية أساسية في علم التشريح (Anatomy)</li>
                <li>الكورس مناسب لطلبة الطب والأطباء حديثي التخرج</li>
                <li>لا يحتاج خبرة سابقة في علم الأشعة</li>
              </ul>

              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>وصف الكورس</h2>
              <div style={{ color: "var(--ink-700)", lineHeight: 1.9, fontSize: 15 }}>
                <p>هذا الكورس مصمم خصيصاً لمساعدتك على إتقان <strong>{course.category}</strong> من الصفر، حتى لو لم يكن لديك أي خبرة سابقة. ستتعلم من خلال أكثر من {totalLessons} درس مقسمين على {modules.length} وحدات تعليمية متدرجة.</p>
                <p style={{ marginTop: 14 }}>المحاضر يستخدم أمثلة عملية وحالات حقيقية من المستشفيات لتثبيت المعلومة، ويوفر اختبارات بعد كل وحدة لتقييم تقدمك. كما يمكنك التواصل مع المحاضر وزملائك في مجتمع الكورس للنقاش وطرح الأسئلة.</p>
                <p style={{ marginTop: 14 }}>بنهاية الكورس ستكون قادراً على تشخيص الحالات الشائعة بثقة، وتمييز الفروق الدقيقة بين الأنواع المختلفة من الفحوصات الإشعاعية.</p>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>محتوى الكورس</h2>
                <span style={{ color: "var(--ink-500)", fontSize: 14 }}>
                  {modules.length} وحدات · {totalLessons} درس · {course.duration || "8 ساعات"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {modules.map((mod, mi) => (
                  <div key={mi} className="card" style={{ overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenModule(openModule === mi ? -1 : mi)}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "right",
                        background: openModule === mi ? "var(--bg-soft)" : "transparent",
                      }}
                    >
                      <Icon name={openModule === mi ? "chevron-down" : "chevron-left"} size={18} style={{ color: "var(--ink-400)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-900)" }}>{mod.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
                        {mod.lessons.length} دروس · {mod.duration}
                      </div>
                    </button>
                    {openModule === mi && (
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {mod.lessons.map((l, li) => (
                          <div key={li} style={{
                            padding: "12px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            borderBottom: li < mod.lessons.length - 1 ? "1px solid var(--border)" : "none",
                          }}>
                            <Icon name={l.type === "video" ? "play" : l.type === "quiz" ? "quiz" : "file"} size={16} style={{ color: "var(--ink-500)" }} />
                            <div style={{ flex: 1, fontSize: 14, color: "var(--ink-800)" }}>{l.title}</div>
                            {l.preview && (
                              <button style={{ color: "var(--brand-blue)", fontSize: 13, fontWeight: 600 }}>
                                معاينة
                              </button>
                            )}
                            {!l.preview && <Icon name="lock" size={14} style={{ color: "var(--ink-400)" }} />}
                            <div style={{ fontSize: 13, color: "var(--ink-500)", minWidth: 70, textAlign: "left" }}>
                              {l.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
                  <Avatar name={course.instructor || "د. سامي حسن"} size={88} />
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{course.instructor || "د. سامي حسن"}</h2>
                    <div style={{ color: "var(--ink-600)", fontSize: 14, marginBottom: 12 }}>
                      استشاري الأشعة التشخيصية · جامعة القاهرة
                    </div>
                    <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon name="star-filled" size={14} style={{ color: "#F59E0B" }} />
                          <span style={{ fontWeight: 700 }}>4.9</span>
                        </div>
                        <div style={{ color: "var(--ink-500)" }}>تقييم المحاضر</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>5,420</div>
                        <div style={{ color: "var(--ink-500)" }}>طالب</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>8</div>
                        <div style={{ color: "var(--ink-500)" }}>كورسات</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ color: "var(--ink-700)", lineHeight: 1.9, fontSize: 15 }}>
                  <p>د. سامي حسن استشاري أشعة تشخيصية بأكثر من ١٥ سنة خبرة في المستشفيات الجامعية والخاصة. حاصل على الزمالة المصرية والأمريكية في الأشعة التشخيصية، وعضو في الجمعية الأوروبية للأشعة (ESR).</p>
                  <p style={{ marginTop: 14 }}>درّب أكثر من ٥٠٠٠ طالب وطبيب في مصر والوطن العربي، وله أبحاث منشورة في دوريات عالمية محكمة. شغوف بتبسيط علم الأشعة وإيصاله بطريقة عملية يفهمها الطالب.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, marginBottom: 32, padding: 24, background: "var(--bg-soft)", borderRadius: "var(--r-lg)" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, color: "var(--ink-900)", lineHeight: 1, fontFamily: '"Playfair Display", serif' }}>
                    {course.rating || 4.8}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 2, color: "#F59E0B", margin: "8px 0" }}>
                    {[1,2,3,4,5].map(i => <Icon key={i} name="star-filled" size={18} />)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-500)" }}>{course.students || "1,200"} تقييم</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[{ s: 5, p: 78 }, { s: 4, p: 18 }, { s: 3, p: 3 }, { s: 2, p: 1 }, { s: 1, p: 0 }].map(b => (
                    <div key={b.s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ minWidth: 16 }}>{b.s}★</span>
                      <div className="progress" style={{ flex: 1, height: 8 }}>
                        <div className="progress-fill" style={{ width: `${b.p}%`, background: "#F59E0B" }} />
                      </div>
                      <span style={{ minWidth: 36, color: "var(--ink-500)" }}>{b.p}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {reviews.map((r, i) => (
                  <div key={i} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <Avatar name={r.user} size={44} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-500)" }}>
                          <span style={{ display: "flex", color: "#F59E0B" }}>
                            {[...Array(r.rating)].map((_, j) => <Icon key={j} name="star-filled" size={12} />)}
                          </span>
                          <span>· {r.time}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.7 }}>{r.text}</div>
                  </div>
                ))}
                <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>عرض المزيد من التقييمات</button>
              </div>
            </div>
          )}
        </div>

        {/* Empty space — sidebar card is sticky in hero */}
        <div />
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .landing-hero { grid-template-columns: 1fr !important; }
          .landing-content { grid-template-columns: 1fr !important; }
          .landing-content > div:last-child { display: none; }
          .learnings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

window.CourseLandingScreen = CourseLandingScreen;

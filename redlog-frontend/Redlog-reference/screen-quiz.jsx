/* global React, Icon, Avatar */
const { useState: useStateQuiz, useEffect: useEffectQuiz, useRef: useRefQuiz } = React;

/* =========================================================
   QUIZ — supports MCQ, True/False, Match, Image-based
   ========================================================= */

// X-ray illustration component (mock medical image)
const XrayMock = ({ variant = "chest", w = 240, h = 200 }) => {
  const id = `xray-${variant}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg width={w} height={h} viewBox="0 0 240 200" style={{
      background: "radial-gradient(ellipse at center, #1a3550 0%, #060d18 90%)",
      borderRadius: 8,
    }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,.05)" />
        </radialGradient>
      </defs>
      {variant === "chest" && (
        <g stroke="rgba(255,255,255,.55)" strokeWidth="1" fill="none">
          {/* Ribcage */}
          <ellipse cx="120" cy="100" rx="70" ry="55" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" fill={`url(#${id})`} fillOpacity=".3" />
          <path d="M65 70 Q120 60 175 70 M62 90 Q120 78 178 90 M62 110 Q120 100 178 110 M65 130 Q120 122 175 130" />
          {/* Spine */}
          <line x1="120" y1="50" x2="120" y2="160" strokeDasharray="2 2" />
          {/* Heart shadow */}
          <ellipse cx="105" cy="110" rx="25" ry="32" fill="rgba(255,255,255,.18)" stroke="none" />
          {/* Anomaly hint */}
          <circle cx="155" cy="95" r="10" fill="rgba(255,255,255,.45)" stroke="none" />
          <circle cx="155" cy="95" r="14" stroke="rgba(255,200,100,.6)" strokeWidth="1" strokeDasharray="3 2" />
        </g>
      )}
      {variant === "skull" && (
        <g stroke="rgba(255,255,255,.6)" strokeWidth="1.2" fill="none">
          <ellipse cx="120" cy="95" rx="55" ry="65" fill={`url(#${id})`} fillOpacity=".3" />
          <circle cx="100" cy="85" r="8" fill="rgba(0,0,0,.5)" stroke="none" />
          <circle cx="140" cy="85" r="8" fill="rgba(0,0,0,.5)" stroke="none" />
          <path d="M120 100 Q115 115 120 125 Q125 115 120 100" />
          <line x1="105" y1="135" x2="135" y2="135" />
        </g>
      )}
      {variant === "knee" && (
        <g stroke="rgba(255,255,255,.6)" strokeWidth="1.2" fill="none">
          <rect x="100" y="30" width="40" height="60" rx="8" fill={`url(#${id})`} fillOpacity=".25"/>
          <ellipse cx="120" cy="100" rx="38" ry="22" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.7)" />
          <rect x="105" y="115" width="30" height="55" rx="6" fill={`url(#${id})`} fillOpacity=".25"/>
          <line x1="120" y1="100" x2="120" y2="115" stroke="rgba(255,100,100,.7)" strokeWidth="1.5" strokeDasharray="3 2"/>
        </g>
      )}
      {variant === "abdomen" && (
        <g stroke="rgba(255,255,255,.55)" strokeWidth="1" fill="none">
          <rect x="40" y="40" width="160" height="120" rx="20" fill={`url(#${id})`} fillOpacity=".25"/>
          <path d="M60 80 Q120 70 180 80 M60 110 Q120 100 180 110 M60 140 Q120 130 180 140" />
          <ellipse cx="90" cy="95" rx="18" ry="14" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.6)"/>
          <circle cx="155" cy="120" r="8" fill="rgba(255,200,100,.5)" stroke="none"/>
        </g>
      )}
      {/* Watermark */}
      <text x="10" y="195" fill="rgba(255,255,255,.4)" fontSize="8" fontFamily="monospace">RADLOG · {variant.toUpperCase()}</text>
    </svg>
  );
};

const QuizScreen = ({ onExit }) => {
  const [phase, setPhase] = useStateQuiz("intro");
  const [currentQ, setCurrentQ] = useStateQuiz(0);
  const [answers, setAnswers] = useStateQuiz({});
  const [timeLeft, setTimeLeft] = useStateQuiz(15 * 60);

  const questions = [
    {
      type: "mcq",
      q: "ما هو الفرق الرئيسي بين الأشعة السينية (X-ray) والأشعة المقطعية (CT Scan)؟",
      options: [
        "الأشعة السينية تعطي صورة ثلاثية الأبعاد، أما المقطعية فثنائية",
        "المقطعية تنتج صوراً مقطعية تفصيلية، والسينية تنتج صورة مسطحة واحدة",
        "السينية تستخدم المغناطيسية، والمقطعية تستخدم الإشعاع",
        "كلاهما متطابق ولا فرق بينهما",
      ],
      correct: 1,
      explanation: "الأشعة المقطعية CT تستخدم سلسلة من الصور السينية لإنتاج مقاطع عرضية تفصيلية للجسم، بينما الـ X-ray تنتج صورة مسطحة واحدة فقط.",
    },
    {
      type: "image-mcq",
      q: "بالنظر للصورة التالية لأشعة الصدر، ما هي العلامة المرضية الظاهرة في الجزء المعلّم؟",
      image: "chest",
      caption: "أشعة سينية للصدر - منظور أمامي خلفي",
      options: [
        "Pneumothorax (انخماص رئوي)",
        "Pulmonary nodule (عقدة رئوية)",
        "Pleural effusion (انصباب جنبي)",
        "Cardiomegaly (تضخم القلب)",
      ],
      correct: 1,
      explanation: "العلامة المعلّمة بالدائرة الصفراء هي عقدة رئوية (Pulmonary nodule) واضحة، وتظهر ككتلة دائرية كثيفة محددة الحدود في الفص العلوي للرئة اليمنى.",
    },
    {
      type: "true-false",
      q: "الرنين المغناطيسي MRI يستخدم الإشعاع المؤيّن (Ionizing radiation) في إنتاج الصور.",
      correct: false,
      explanation: "خطأ. الـ MRI يستخدم مجالاً مغناطيسياً قوياً وموجات راديو، ولا يستخدم أي إشعاع مؤين، وهذا ما يجعله آمناً للحوامل والأطفال.",
    },
    {
      type: "mcq",
      q: "أي من الأنواع التالية يُفضّل استخدامه لتشخيص إصابات الأنسجة الرخوة؟",
      options: ["الأشعة السينية X-ray", "الأشعة المقطعية CT", "الرنين المغناطيسي MRI", "الموجات فوق الصوتية فقط"],
      correct: 2,
      explanation: "الرنين المغناطيسي MRI يُعتبر الأفضل لتصوير الأنسجة الرخوة كالعضلات والأربطة والدماغ.",
    },
    {
      type: "match",
      q: "وصّل كل نوع من الفحوصات الإشعاعية بالاستخدام الأنسب له:",
      left: [
        { id: "a", label: "X-ray" },
        { id: "b", label: "CT Scan" },
        { id: "c", label: "MRI" },
        { id: "d", label: "Ultrasound" },
      ],
      right: [
        { id: "1", label: "تشخيص إصابات الأربطة والغضاريف" },
        { id: "2", label: "متابعة الحمل والأجنة" },
        { id: "3", label: "كشف الكسور البسيطة" },
        { id: "4", label: "تصوير النزيف الداخلي بسرعة" },
      ],
      correct: { a: "3", b: "4", c: "1", d: "2" },
      explanation: "X-ray ممتاز للكسور لسرعته ورخصه. CT الأفضل للنزيف الداخلي الحاد. MRI متفوق على الأنسجة الرخوة. الموجات فوق الصوتية آمنة للأجنة.",
    },
    {
      type: "image-mcq",
      q: "في صورة أشعة الركبة التالية، أين موقع الكسر المحتمل؟",
      image: "knee",
      caption: "أشعة ركبة جانبية",
      options: [
        "في عظمة الفخذ (Femur)",
        "بين الـ Femur والـ Tibia (المفصل)",
        "في الـ Patella فقط",
        "لا يوجد كسر",
      ],
      correct: 1,
      explanation: "الخط الأحمر المتقطع يشير إلى موضع المفصل بين عظمة الفخذ والقصبة، وهو موضع شائع للكسور المعقدة وإصابات الأربطة.",
    },
    {
      type: "true-false",
      q: "يجب على المريض الصيام لمدة ٤ ساعات قبل إجراء أشعة CT بالصبغة، وذلك للحد من خطر الغثيان والقيء.",
      correct: true,
      explanation: "صحيح. الصيام لمدة ٤ ساعات مطلوب قبل CT بالصبغة لتقليل احتمالية الغثيان، كما يجب التأكد من سلامة وظائف الكلى لأن الصبغة تطرح عبرها.",
    },
    {
      type: "mcq",
      q: "ما هي وحدة قياس جرعة الإشعاع الممتصة؟",
      options: ["Gray (Gy)", "Hertz (Hz)", "Pascal (Pa)", "Newton (N)"],
      correct: 0,
      explanation: "الـ Gray (Gy) هي وحدة الجرعة الممتصة من الإشعاع المؤين، وتعادل امتصاص جول واحد لكل كيلوجرام من المادة.",
    },
  ];

  useEffectQuiz(() => {
    if (phase !== "taking") return;
    const t = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const isCorrect = (qi) => {
    const q = questions[qi];
    const a = answers[qi];
    if (a === undefined) return false;
    if (q.type === "match") {
      return q.left.every(l => a[l.id] === q.correct[l.id]);
    }
    return a === q.correct;
  };

  const correctCount = questions.reduce((sum, _, i) => sum + (isCorrect(i) ? 1 : 0), 0);
  const score = Math.round((correctCount / questions.length) * 100);

  // ============ INTRO ============
  if (phase === "intro") {
    const counts = questions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc; }, {});
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="card" style={{ maxWidth: 540, padding: 40, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 20px", borderRadius: "50%", background: "var(--brand-blue-100)", color: "var(--brand-blue-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="quiz" size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "var(--ink-900)" }}>اختبار الوحدة الأولى</h1>
          <p style={{ color: "var(--ink-600)", margin: "0 0 24px" }}>مقدمة وأساسيات علم الأشعة</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "var(--bg-soft)", padding: 16, borderRadius: "var(--r-md)", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-900)" }}>{questions.length}</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)" }}>أسئلة</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-900)" }}>15</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)" }}>دقيقة</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink-900)" }}>70%</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)" }}>للنجاح</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            {counts.mcq && <span className="badge badge-blue">{counts.mcq} اختيار من متعدد</span>}
            {counts["true-false"] && <span className="badge badge-green">{counts["true-false"]} صح / خطأ</span>}
            {counts["image-mcq"] && <span className="badge badge-amber">{counts["image-mcq"]} أسئلة بصور</span>}
            {counts.match && <span className="badge badge-gray">{counts.match} توصيل</span>}
          </div>

          <div style={{ background: "var(--warning-soft)", color: "var(--warning)", padding: "12px 16px", borderRadius: "var(--r-md)", fontSize: 13, marginBottom: 24, textAlign: "right" }}>
            ⚠️ تنبيه: لا يمكنك الرجوع لمراجعة الإجابات بعد الانتقال للسؤال التالي.
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={onExit}>إلغاء</button>
            <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={() => setPhase("taking")}>بدء الاختبار</button>
          </div>
        </div>
      </div>
    );
  }

  // ============ RESULT ============
  if (phase === "result") {
    const passed = score >= 70;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-soft)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="card" style={{ padding: 40, textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 100, height: 100, margin: "0 auto 20px", borderRadius: "50%", background: passed ? "var(--success-soft)" : "var(--warning-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
              {passed ? "🎉" : "📚"}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "var(--ink-900)" }}>
              {passed ? "مبروك! نجحت في الاختبار" : "حاول مرة أخرى"}
            </h1>
            <p style={{ color: "var(--ink-600)", margin: "0 0 24px" }}>
              {passed ? "أداء رائع، استمر على هذا المستوى" : "راجع المحاضرات وأعد المحاولة"}
            </p>
            <div style={{ fontSize: 64, fontWeight: 800, color: passed ? "var(--success)" : "var(--warning)", fontFamily: '"Playfair Display", serif', lineHeight: 1, margin: "0 0 8px" }}>{score}%</div>
            <div style={{ fontSize: 16, color: "var(--ink-600)", marginBottom: 24 }}>
              {correctCount} من {questions.length} إجابات صحيحة
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "var(--bg-soft)", padding: 16, borderRadius: "var(--r-md)" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>{correctCount}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>صحيحة</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--danger)" }}>{questions.length - correctCount}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>خاطئة</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-700)" }}>{fmt((15 * 60) - timeLeft)}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>الوقت المستغرق</div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>مراجعة الإجابات</h2>
          {questions.map((q, qi) => {
            const right = isCorrect(qi);
            return (
              <div key={qi} className="card" style={{ padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: right ? "var(--success-soft)" : "var(--danger-soft)", color: right ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={right ? "check" : "x"} size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 4 }}>
                      السؤال {qi + 1} · {q.type === "mcq" ? "اختيار من متعدد" : q.type === "true-false" ? "صح / خطأ" : q.type === "image-mcq" ? "سؤال بصورة" : "توصيل"}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-900)", lineHeight: 1.6 }}>{q.q}</div>
                  </div>
                </div>
                <div style={{ marginRight: 44, padding: 12, background: "var(--brand-blue-50)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--ink-700)", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: "var(--brand-blue-700)" }}>💡 شرح: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => { setPhase("intro"); setCurrentQ(0); setAnswers({}); setTimeLeft(15 * 60); }}>إعادة الاختبار</button>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={onExit}>العودة للكورس</button>
          </div>
        </div>
      </div>
    );
  }

  // ============ TAKING ============
  const q = questions[currentQ];
  const answered = q.type === "match"
    ? answers[currentQ] && Object.keys(answers[currentQ] || {}).length === q.left.length
    : answers[currentQ] !== undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-soft)" }}>
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm("هل تريد الخروج؟")) onExit(); }}>
          <Icon name="x" size={16} /> إنهاء
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--ink-500)" }}>اختبار الوحدة الأولى</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>السؤال {currentQ + 1} من {questions.length}</div>
        </div>
        <div style={{ background: timeLeft < 60 ? "var(--danger-soft)" : "var(--brand-blue-100)", color: timeLeft < 60 ? "var(--danger)" : "var(--brand-blue-700)", padding: "8px 14px", borderRadius: "var(--r-md)", fontWeight: 700, fontFamily: "monospace", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="clock" size={16} />{fmt(timeLeft)}
        </div>
      </div>

      <div style={{ height: 4, background: "var(--bg-muted)" }}>
        <div style={{ height: "100%", width: `${((currentQ + 1) / questions.length) * 100}%`, background: "var(--brand-blue)", transition: "width .3s" }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}>سؤال {currentQ + 1}</span>
          <span className={`badge ${q.type === "mcq" ? "badge-blue" : q.type === "true-false" ? "badge-green" : q.type === "image-mcq" ? "badge-amber" : "badge-gray"}`}>
            {q.type === "mcq" ? "اختيار من متعدد" : q.type === "true-false" ? "صح أم خطأ" : q.type === "image-mcq" ? "سؤال بصورة" : "توصيل"}
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 24px", lineHeight: 1.6, color: "var(--ink-900)" }}>{q.q}</h2>

        {/* Image */}
        {q.image && (
          <div style={{ marginBottom: 28, padding: 16, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", textAlign: "center" }}>
            <XrayMock variant={q.image} w={320} h={260} />
            {q.caption && <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 8 }}>{q.caption}</div>}
          </div>
        )}

        {/* MCQ + image-mcq */}
        {(q.type === "mcq" || q.type === "image-mcq") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[currentQ] === oi;
              return (
                <button key={oi} onClick={() => setAnswers({ ...answers, [currentQ]: oi })}
                  style={{
                    textAlign: "right", padding: "16px 20px", borderRadius: "var(--r-md)",
                    border: `2px solid ${selected ? "var(--brand-blue)" : "var(--border)"}`,
                    background: selected ? "var(--brand-blue-50)" : "var(--bg)",
                    display: "flex", alignItems: "center", gap: 14, fontSize: 15,
                    fontWeight: selected ? 600 : 500,
                    color: selected ? "var(--brand-blue-700)" : "var(--ink-800)",
                    transition: "all .15s",
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    border: `2px solid ${selected ? "var(--brand-blue)" : "var(--border-strong)"}`,
                    background: selected ? "var(--brand-blue)" : "transparent",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>
                    {selected ? <Icon name="check" size={14} /> : String.fromCharCode(0x0623 + oi)}
                  </div>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* True / False */}
        {q.type === "true-false" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { val: true, label: "صح", icon: "check", color: "var(--success)" },
              { val: false, label: "خطأ", icon: "x", color: "var(--danger)" },
            ].map((opt) => {
              const selected = answers[currentQ] === opt.val;
              return (
                <button key={String(opt.val)} onClick={() => setAnswers({ ...answers, [currentQ]: opt.val })}
                  style={{
                    padding: "32px 20px", borderRadius: "var(--r-lg)",
                    border: `2px solid ${selected ? opt.color : "var(--border)"}`,
                    background: selected ? `${opt.color}10` : "var(--bg)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    fontSize: 20, fontWeight: 700,
                    color: selected ? opt.color : "var(--ink-700)",
                    transition: "all .15s",
                  }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: selected ? opt.color : "var(--bg-muted)",
                    color: selected ? "#fff" : "var(--ink-500)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={opt.icon} size={28} />
                  </div>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Match */}
        {q.type === "match" && (() => {
          const matchAns = answers[currentQ] || {};
          const usedRights = Object.values(matchAns);
          return (
            <div>
              <div style={{ background: "var(--brand-blue-50)", color: "var(--ink-700)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                💡 اضغط على البند من اليمين، ثم اختر التوصيل المناسب من القائمة المنسدلة.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.left.map(l => {
                  const sel = matchAns[l.id];
                  return (
                    <div key={l.id} style={{
                      display: "grid", gridTemplateColumns: "1fr auto 1.5fr", gap: 12,
                      alignItems: "center",
                      padding: 14, borderRadius: "var(--r-md)",
                      border: "1px solid var(--border)", background: "var(--bg)",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{l.label}</div>
                      <div style={{ color: "var(--ink-400)" }}>←</div>
                      <select className="input" value={sel || ""} onChange={(e) => setAnswers({ ...answers, [currentQ]: { ...matchAns, [l.id]: e.target.value } })}>
                        <option value="">— اختر التوصيل —</option>
                        {q.right.map(r => (
                          <option key={r.id} value={r.id} disabled={usedRights.includes(r.id) && sel !== r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-ghost btn-lg" disabled={currentQ === 0} onClick={() => setCurrentQ(c => Math.max(0, c - 1))} style={{ opacity: currentQ === 0 ? 0.4 : 1 }}>
            <Icon name="chevron-right" size={16} /> السابق
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%",
                background: answers[i] !== undefined ? "var(--brand-blue)" : i === currentQ ? "var(--brand-blue-100)" : "var(--bg-muted)",
                border: i === currentQ ? "2px solid var(--brand-blue)" : "none",
              }} />
            ))}
          </div>
          {currentQ === questions.length - 1 ? (
            <button className="btn btn-primary btn-lg" disabled={!answered} onClick={() => setPhase("result")}>
              إنهاء الاختبار <Icon name="check" size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={!answered} onClick={() => setCurrentQ(c => c + 1)}>
              التالي <Icon name="chevron-left" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

window.QuizScreen = QuizScreen;

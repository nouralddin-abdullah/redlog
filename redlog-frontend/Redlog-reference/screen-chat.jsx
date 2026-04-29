/* global React, Icon, Avatar */
const { useState: useStateChat, useEffect: useEffectChat, useRef: useRefChat } = React;

/* =========================================================
   COURSE CHAT ROOM — real-time group chat
   ========================================================= */
const ChatScreen = ({ courses }) => {
  const enrolled = courses.filter(c => c.progress !== undefined);
  const [activeCourse, setActiveCourse] = useStateChat(enrolled[0]?.id || courses[0].id);
  const [text, setText] = useStateChat("");
  const [messages, setMessages] = useStateChat({
    [enrolled[0]?.id]: [
      { id: 1, user: "د. سامي حسن", role: "instructor", time: "10:24 ص", text: "صباح الخير يا شباب! النهارده هنشرح حالة مهمة من حالات الالتهاب الرئوي، خلوا بالكوا من اللحظة 12:30 في الفيديو 👨‍⚕️" },
      { id: 2, user: "سارة علي", time: "10:31 ص", text: "صباح النور يا دكتور 🌸 الفيديو الجديد رائع، شكراً جزيلاً!" },
      { id: 3, user: "محمد خالد", time: "10:42 ص", text: "عندي سؤال بخصوص الفرق بين الـ consolidation والـ ground-glass opacity، حد فاهم الموضوع كويس؟" },
      { id: 4, user: "ليلى أحمد", time: "10:45 ص", text: "@محمد خالد الـ consolidation بيكون أكثر كثافة وبيخفي الـ vascular markings، أما ground-glass بيكون شفاف نسبياً وبتفضل الـ markings ظاهرة" },
      { id: 5, user: "محمد خالد", time: "10:47 ص", text: "تمام كده وضحت، شكراً ليلى! 🙏" },
      { id: 6, user: "د. سامي حسن", role: "instructor", time: "11:02 ص", text: "إجابة ممتازة من ليلى 👏 هضيف بس إن الـ ground-glass ممكن يبقى مرحلة مبكرة من الـ consolidation، فلازم نتابع المريض" },
      { id: 7, user: "أحمد عبدالرحمن", time: "11:15 ص", text: "اللي حضر الكوِيز امبارح، إيه رأيكم في صعوبة الأسئلة؟" },
      { id: 8, user: "نور الهدى", time: "11:18 ص", text: "كان متوسط، بس السؤال رقم ٧ كان محتاج تركيز شديد 😅" },
    ],
    [enrolled[1]?.id]: [
      { id: 1, user: "د. منى فاروق", role: "instructor", time: "9:00 ص", text: "أهلاً بكم في كورس Pediatric Radiology" },
    ],
  });

  const messagesEndRef = useRefChat();
  useEffectChat(() => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeCourse]);

  const send = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: "أحمد محمد",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      text: text.trim(),
      mine: true,
    };
    setMessages({
      ...messages,
      [activeCourse]: [...(messages[activeCourse] || []), newMsg],
    });
    setText("");
  };

  const onlineUsers = [
    { name: "د. سامي حسن", role: "instructor" },
    { name: "سارة علي" },
    { name: "محمد خالد" },
    { name: "ليلى أحمد" },
    { name: "نور الهدى" },
    { name: "أحمد عبدالرحمن" },
    { name: "كريم سعيد" },
  ];

  const currentMessages = messages[activeCourse] || [];
  const currentCourse = courses.find(c => c.id === activeCourse);

  return (
    <div style={{
      height: "calc(100vh - var(--topbar-h))",
      display: "grid",
      gridTemplateColumns: "260px 1fr 240px",
      background: "var(--bg)",
    }} className="chat-shell">
      {/* Course list */}
      <div style={{
        borderLeft: "1px solid var(--border)",
        overflowY: "auto",
        background: "var(--bg)",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>المحادثات</h3>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{enrolled.length} كورسات</div>
        </div>
        {enrolled.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCourse(c.id)}
            style={{
              width: "100%",
              padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12,
              textAlign: "right",
              background: activeCourse === c.id ? "var(--brand-blue-50)" : "transparent",
              borderRight: activeCourse === c.id ? "3px solid var(--brand-blue)" : "3px solid transparent",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `linear-gradient(135deg, ${c.color} 0%, ${c.color2} 100%)`,
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700, fontSize: 15,
              flexShrink: 0,
            }}>{c.short}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: activeCourse === c.id ? "var(--brand-blue-700)" : "var(--ink-800)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "var(--ink-500)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(messages[c.id] || []).slice(-1)[0]?.text || "لا توجد رسائل"}
              </div>
            </div>
            {Math.random() > 0.5 && (
              <span style={{
                background: "var(--brand-blue)", color: "#fff",
                fontSize: 10, fontWeight: 700,
                width: 18, height: 18, borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{Math.floor(Math.random() * 9) + 1}</span>
            )}
          </button>
        ))}
      </div>

      {/* Chat main */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${currentCourse.color} 0%, ${currentCourse.color2} 100%)`,
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700, fontSize: 16,
          }}>{currentCourse.short}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{currentCourse.title}</div>
            <div style={{ fontSize: 12, color: "var(--success)" }}>
              ● {onlineUsers.length} عضو متصل الآن
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesEndRef} style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          background: "var(--bg-soft)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 16, fontSize: 12, color: "var(--ink-500)" }}>
            <span style={{
              background: "var(--bg)",
              padding: "4px 12px",
              borderRadius: 999,
              border: "1px solid var(--border)",
            }}>اليوم</span>
          </div>

          {currentMessages.map((m, i) => {
            const prev = currentMessages[i - 1];
            const sameUser = prev && prev.user === m.user && !prev.mine && !m.mine;
            const mine = m.mine;
            return (
              <div key={m.id} style={{
                display: "flex",
                gap: 10,
                marginBottom: sameUser ? 4 : 14,
                flexDirection: mine ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}>
                <div style={{ width: 36, flexShrink: 0 }}>
                  {!sameUser && !mine && <Avatar name={m.user} size={36} />}
                </div>
                <div style={{ maxWidth: "65%" }}>
                  {!sameUser && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      marginBottom: 4,
                      flexDirection: mine ? "row-reverse" : "row",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-800)" }}>
                        {mine ? "أنت" : m.user}
                      </span>
                      {m.role === "instructor" && (
                        <span style={{
                          background: "var(--brand-blue-100)", color: "var(--brand-blue-700)",
                          fontSize: 10, fontWeight: 700,
                          padding: "1px 8px", borderRadius: 999,
                        }}>محاضر</span>
                      )}
                      <span style={{ fontSize: 11, color: "var(--ink-400)" }}>{m.time}</span>
                    </div>
                  )}
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: mine
                      ? "12px 12px 4px 12px"
                      : sameUser ? "12px 4px 12px 12px" : "12px 12px 12px 4px",
                    background: mine ? "var(--brand-blue)" : "var(--bg)",
                    color: mine ? "#fff" : "var(--ink-800)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow: "var(--shadow-xs)",
                    border: mine ? "none" : "1px solid var(--border)",
                    wordBreak: "break-word",
                  }}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div style={{
          padding: 14,
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <button style={{ color: "var(--ink-500)", padding: 6 }}>
            <Icon name="paperclip" size={20} />
          </button>
          <button style={{ color: "var(--ink-500)", padding: 6 }}>
            <Icon name="image" size={20} />
          </button>
          <input
            className="input"
            placeholder="اكتب رسالتك..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            style={{ flex: 1, border: "none", background: "var(--bg-soft)" }}
          />
          <button style={{ color: "var(--ink-500)", padding: 6 }}>
            <Icon name="smile" size={20} />
          </button>
          <button className="btn btn-primary" onClick={send} disabled={!text.trim()}>
            <Icon name="send" size={16} /> إرسال
          </button>
        </div>
      </div>

      {/* Online users */}
      <aside className="chat-online" style={{
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        background: "var(--bg)",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>الأعضاء المتصلون</h3>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{onlineUsers.length} عضو</div>
        </div>
        {onlineUsers.map((u, i) => (
          <div key={i} style={{
            padding: "10px 18px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ position: "relative" }}>
              <Avatar name={u.name} size={32} />
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                width: 10, height: 10, borderRadius: "50%",
                background: "var(--success)",
                border: "2px solid var(--bg)",
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{u.name}</div>
              {u.role === "instructor" && (
                <div style={{ fontSize: 11, color: "var(--brand-blue)" }}>محاضر</div>
              )}
            </div>
          </div>
        ))}
      </aside>

      <style>{`
        @media (max-width: 1100px) {
          .chat-shell { grid-template-columns: 240px 1fr !important; }
          .chat-online { display: none; }
        }
        @media (max-width: 700px) {
          .chat-shell { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

window.ChatScreen = ChatScreen;

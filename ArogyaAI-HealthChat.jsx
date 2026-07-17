import { useState, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Content: bilingual strings (Hindi kept in Devanagari, no Hinglish mixing)
// ---------------------------------------------------------------------------
const STR = {
  en: {
    appName: "ArogyaAI",
    tagline: "Your health questions, answered clearly",
    newChat: "New chat",
    topics: "Common topics",
    emergencyTitle: "Medical emergency?",
    emergencyBody: "Call 112 or 108 immediately, or go to the nearest hospital.",
    mentalHealthTitle: "Need to talk to someone right now?",
    mentalHealthBody: "KIRAN Helpline (24/7, toll-free): 1800-599-0019",
    disclaimer: "General health information only — not a diagnosis. Always consult a licensed doctor.",
    placeholder: "Describe your symptoms or ask a health question…",
    send: "Send",
    thinking: "Thinking",
    welcome:
      "Hello! I'm ArogyaAI, a bilingual health information assistant. Tell me your symptoms or ask about any condition, and I'll explain it clearly. For emergencies, please call 112 or 108 right away.",
    errorMsg: "Something went wrong. Please try again.",
    you: "You",
    assistant: "ArogyaAI",
    footerNote: "Not a substitute for professional medical care.",
    langLabel: "Language",
    emptyHint: "Tap a topic to start, or type your own question below.",
  },
  hi: {
    appName: "आरोग्य AI",
    tagline: "आपके स्वास्थ्य सवालों के स्पष्ट जवाब",
    newChat: "नई बातचीत",
    topics: "सामान्य विषय",
    emergencyTitle: "चिकित्सा आपातकाल?",
    emergencyBody: "तुरंत 112 या 108 पर कॉल करें, या नज़दीकी अस्पताल जाएं।",
    mentalHealthTitle: "अभी किसी से बात करनी है?",
    mentalHealthBody: "किरण हेल्पलाइन (24/7, टोल-फ्री): 1800-599-0019",
    disclaimer: "यह सामान्य स्वास्थ्य जानकारी है — निदान नहीं। कृपया हमेशा किसी पंजीकृत डॉक्टर से सलाह लें।",
    placeholder: "अपने लक्षण बताएं या स्वास्थ्य से जुड़ा सवाल पूछें…",
    send: "भेजें",
    thinking: "सोच रहा है",
    welcome:
      "नमस्ते! मैं आरोग्य AI हूं, एक द्विभाषी स्वास्थ्य जानकारी सहायक। अपने लक्षण बताएं या किसी भी बीमारी के बारे में पूछें, मैं आपको स्पष्ट रूप से समझाऊंगा। आपातकाल में कृपया तुरंत 112 या 108 पर कॉल करें।",
    errorMsg: "कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।",
    you: "आप",
    assistant: "आरोग्य AI",
    footerNote: "यह पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।",
    langLabel: "भाषा",
    emptyHint: "शुरू करने के लिए कोई विषय चुनें, या नीचे अपना सवाल टाइप करें।",
  },
};

const CATEGORIES = [
  { en: "Fever", hi: "बुखार" },
  { en: "Cold & Cough", hi: "सर्दी-खांसी" },
  { en: "Diabetes", hi: "मधुमेह" },
  { en: "Blood Pressure", hi: "ब्लड प्रेशर" },
  { en: "Skin & Allergy", hi: "त्वचा व एलर्जी" },
  { en: "Stomach Issues", hi: "पेट की समस्या" },
  { en: "Women's Health", hi: "महिला स्वास्थ्य" },
  { en: "Mental Health", hi: "मानसिक स्वास्थ्य" },
  { en: "Child Health", hi: "बच्चों का स्वास्थ्य" },
  { en: "Headache & Migraine", hi: "सिरदर्द व माइग्रेन" },
];

const EMERGENCY_WORDS = [
  "chest pain", "can't breathe", "cannot breathe", "difficulty breathing",
  "unconscious", "unresponsive", "severe bleeding", "heavy bleeding",
  "stroke", "numbness on one side", "seizure", "overdose", "poisoning",
  "सीने में दर्द", "सांस नहीं आ रही", "साँस लेने में तकलीफ", "बेहोश",
  "गंभीर रक्तस्राव", "ज्यादा खून बह रहा", "दौरा", "लकवा", "ज़हर",
];

const CRISIS_WORDS = [
  "suicide", "kill myself", "want to die", "end my life", "self harm", "self-harm",
  "आत्महत्या", "खुदकुशी", "मरना चाहता", "मरना चाहती", "जान देना",
];

function detect(list, text) {
  const t = text.toLowerCase();
  return list.some((w) => t.includes(w.toLowerCase()));
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Signature visual: an ECG / pulse line, used as header strip + avatar + typing cue
// ---------------------------------------------------------------------------
function PulseStrip({ fast }) {
  const seg = "M0,20 L18,20 L24,6 L30,34 L36,14 L42,20 L60,20";
  return (
    <div className="pulse-strip" aria-hidden="true">
      <svg
        className={"pulse-svg" + (fast ? " pulse-fast" : "")}
        viewBox="0 0 240 40"
        preserveAspectRatio="none"
      >
        <path d={seg + " " + seg.replace(/^M0,20/, "L60,20") + " " + seg.replace(/^M0,20/, "L120,20") + " " + seg.replace(/^M0,20/, "L180,20")} />
      </svg>
      <svg
        className={"pulse-svg" + (fast ? " pulse-fast" : "")}
        viewBox="0 0 240 40"
        preserveAspectRatio="none"
      >
        <path d={seg + " " + seg.replace(/^M0,20/, "L60,20") + " " + seg.replace(/^M0,20/, "L120,20") + " " + seg.replace(/^M0,20/, "L180,20")} />
      </svg>
    </div>
  );
}

function PulseAvatar() {
  return (
    <div className="pulse-avatar" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M2,20 L12,20 L16,10 L22,30 L26,14 L30,20 L38,20" />
      </svg>
    </div>
  );
}

export default function ArogyaAI() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([
    { role: "assistant", text: STR.en.welcome, time: nowTime() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const firstLoad = useRef(true);
  const t = STR[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // If the conversation hasn't really started, swap the welcome text on language toggle
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", text: STR[lang].welcome, time: nowTime() }];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function sendMessage(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const isEmergency = detect(EMERGENCY_WORDS, text);
    const isCrisis = detect(CRISIS_WORDS, text);

    const userMsg = { role: "user", text, time: nowTime() };
    const flagMsg = isEmergency || isCrisis
      ? [{ role: "flag", crisis: isCrisis, time: nowTime() }]
      : [];

    const history = [...messages, userMsg];
    setMessages([...history, ...flagMsg]);
    setInput("");
    setLoading(true);

    const langName = lang === "hi" ? "Hindi (Devanagari script)" : "English";
    const system = `You are ArogyaAI, a warm, careful bilingual healthcare information assistant for users in India. Respond ONLY in ${langName}, regardless of what language the user typed in. Cover any disease, condition, or symptom the user asks about.

Structure every answer briefly with:
1) A short plain-language explanation.
2) General self-care guidance (no specific drug names or dosages).
3) Clear red-flag symptoms that need urgent medical attention.
4) A brief reminder that this is general information, not a diagnosis, and to consult a licensed doctor for personal medical advice.

If the message describes a possible emergency (e.g. chest pain, severe breathing difficulty, stroke signs, heavy bleeding, unconsciousness) or mentions suicide or self-harm, your FIRST sentence must clearly tell them to call emergency services now (India: 112, ambulance 108) or a crisis helpline, before anything else.

Keep responses concise: short paragraphs or bullet points, no long preamble, warm and respectful tone suited to Indian users.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: history.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      const reply =
        data?.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") ||
        t.errorMsg;
      setMessages((prev) => [...prev, { role: "assistant", text: reply, time: nowTime() }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: t.errorMsg, time: nowTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function onTopicClick(cat) {
    const label = lang === "hi" ? cat.hi : cat.en;
    const q =
      lang === "hi"
        ? `${label} के बारे में बताएं: कारण, देखभाल के उपाय, और डॉक्टर को कब दिखाना चाहिए।`
        : `Tell me about ${label}: common causes, general care, and when to see a doctor.`;
    setSidebarOpen(false);
    sendMessage(q);
  }

  function newChat() {
    setMessages([{ role: "assistant", text: t.welcome, time: nowTime() }]);
    setInput("");
    setSidebarOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        :root{
          --bg:#F4F7F3;
          --surface:#FFFFFF;
          --surface-alt:#EAF1EA;
          --ink:#16231B;
          --ink-soft:#54685C;
          --ink-faint:#8CA095;
          --primary:#0B6E4F;
          --primary-dark:#085239;
          --primary-tint:#E3F1EA;
          --pulse:#E8A23D;
          --alert:#C7402F;
          --alert-bg:#FBEAE7;
          --alert-border:#F0C4BC;
          --border:#DCE6DE;
        }
        *{ box-sizing:border-box; }
        .app{
          width:100%;
          height:100vh;
          min-height:640px;
          display:flex;
          flex-direction:column;
          background:var(--bg);
          font-family:'Noto Sans','Noto Sans Devanagari',-apple-system,sans-serif;
          color:var(--ink);
          overflow:hidden;
        }
        @media (prefers-reduced-motion: reduce){
          .pulse-svg, .pulse-fast, .blip{ animation:none !important; }
        }

        /* ---------- pulse strip (signature element) ---------- */
        .pulse-strip{
          display:flex;
          width:100%;
          height:22px;
          overflow:hidden;
          background:var(--primary-dark);
          flex-shrink:0;
        }
        .pulse-svg{
          height:22px;
          width:240px;
          flex-shrink:0;
          stroke:var(--pulse);
          stroke-width:2;
          fill:none;
          stroke-linecap:round;
          stroke-linejoin:round;
          animation:pulseMove 5s linear infinite;
        }
        .pulse-fast{ animation-duration:1.1s; }
        @keyframes pulseMove{
          from{ transform:translateX(0); }
          to{ transform:translateX(-240px); }
        }
        .pulse-avatar{
          width:26px; height:26px; border-radius:50%;
          background:var(--primary-tint);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .pulse-avatar svg{ width:20px; height:20px; stroke:var(--primary); stroke-width:2.4; fill:none; stroke-linecap:round; stroke-linejoin:round; }

        /* ---------- shell layout ---------- */
        .shell{ flex:1; display:flex; min-height:0; position:relative; }

        .sidebar{
          width:260px;
          background:var(--surface);
          border-right:1px solid var(--border);
          display:flex;
          flex-direction:column;
          padding:18px 16px;
          gap:18px;
          overflow-y:auto;
          position:absolute;
          top:0; bottom:0; left:0;
          transform:translateX(-100%);
          transition:transform .22s ease;
          z-index:20;
        }
        .sidebar.open{ transform:translateX(0); box-shadow:8px 0 24px rgba(20,30,24,0.14); }
        .backdrop{
          position:absolute; inset:0; background:rgba(15,23,18,0.32);
          z-index:15; display:none;
        }
        .backdrop.show{ display:block; }

        .brand{ display:flex; align-items:center; gap:10px; }
        .brand-name{ font-family:'Noto Serif','Noto Serif Devanagari',serif; font-weight:700; font-size:19px; letter-spacing:.2px; }
        .brand-tag{ font-size:12px; color:var(--ink-soft); margin-top:2px; }

        .btn-new{
          display:flex; align-items:center; gap:8px;
          border:1px solid var(--primary); color:var(--primary-dark);
          background:var(--primary-tint);
          font-weight:600; font-size:14px;
          padding:10px 12px; border-radius:10px; cursor:pointer;
          font-family:inherit;
        }
        .btn-new:hover{ background:#DCEEE3; }

        .section-label{
          font-size:11px; text-transform:uppercase; letter-spacing:.08em;
          color:var(--ink-faint); font-weight:600; margin-bottom:8px;
        }
        .topics{ display:flex; flex-wrap:wrap; gap:8px; }
        .topic-chip{
          border:1px solid var(--border); background:var(--surface-alt);
          color:var(--ink); font-size:13px; padding:7px 11px; border-radius:999px;
          cursor:pointer; font-family:inherit; line-height:1.2;
        }
        .topic-chip:hover{ border-color:var(--primary); color:var(--primary-dark); }

        .side-spacer{ flex:1; }

        .care-card{
          border-radius:12px; padding:12px 13px; border:1px solid;
          display:flex; flex-direction:column; gap:3px;
        }
        .care-card.emergency{ background:var(--alert-bg); border-color:var(--alert-border); }
        .care-card.mental{ background:var(--primary-tint); border-color:#BFE0CE; }
        .care-title{ font-weight:700; font-size:13px; }
        .care-card.emergency .care-title{ color:var(--alert); }
        .care-card.mental .care-title{ color:var(--primary-dark); }
        .care-body{ font-size:12.5px; color:var(--ink-soft); line-height:1.45; }

        /* ---------- main column ---------- */
        .main{ flex:1; display:flex; flex-direction:column; min-width:0; }

        .header{
          display:flex; align-items:center; gap:12px;
          padding:12px 16px; border-bottom:1px solid var(--border);
          background:var(--surface); flex-shrink:0;
        }
        .icon-btn{
          width:36px; height:36px; border-radius:9px; border:1px solid var(--border);
          background:var(--surface); display:flex; align-items:center; justify-content:center;
          cursor:pointer; flex-shrink:0;
        }
        .icon-btn svg{ width:18px; height:18px; stroke:var(--ink); fill:none; stroke-width:2; stroke-linecap:round; }
        .header-title{ font-family:'Noto Serif','Noto Serif Devanagari',serif; font-weight:600; font-size:16px; }
        .header-sub{ font-size:11.5px; color:var(--ink-faint); }
        .header-mid{ flex:1; min-width:0; }

        .lang-toggle{
          display:flex; border:1px solid var(--border); border-radius:999px; padding:3px;
          background:var(--surface-alt); flex-shrink:0; gap:2px;
        }
        .lang-opt{
          border:none; background:transparent; padding:6px 12px; border-radius:999px;
          font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Noto Sans','Noto Sans Devanagari',sans-serif;
          color:var(--ink-soft);
        }
        .lang-opt.active{ background:var(--primary); color:#fff; }

        .disclaimer-bar{
          font-size:11.5px; color:var(--ink-soft); background:var(--surface-alt);
          border-bottom:1px solid var(--border); padding:6px 16px; flex-shrink:0;
          text-align:center;
        }

        .thread{ flex:1; overflow-y:auto; padding:18px 16px 8px; display:flex; flex-direction:column; gap:14px; }
        .empty-hint{ text-align:center; color:var(--ink-faint); font-size:12.5px; margin-top:2px; }

        .row{ display:flex; gap:9px; align-items:flex-end; max-width:100%; }
        .row.user{ justify-content:flex-end; }
        .bubble{
          max-width:78%; padding:11px 14px; border-radius:16px; font-size:14.5px; line-height:1.55;
          white-space:pre-wrap; word-break:break-word;
        }
        .row.assistant .bubble{ background:var(--surface); border:1px solid var(--border); border-bottom-left-radius:4px; }
        .row.user .bubble{ background:var(--primary); color:#fff; border-bottom-right-radius:4px; }
        .meta{ font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:10px; color:var(--ink-faint); margin-top:4px; }
        .row.user .meta{ text-align:right; }

        .flag-row{ display:flex; justify-content:center; }
        .flag-card{
          display:flex; gap:10px; align-items:flex-start;
          background:var(--alert-bg); border:1px solid var(--alert-border); color:var(--alert);
          padding:11px 14px; border-radius:12px; font-size:13.5px; max-width:88%;
        }
        .flag-card svg{ width:18px; height:18px; flex-shrink:0; margin-top:1px; stroke:var(--alert); fill:none; stroke-width:2.2; }
        .flag-title{ font-weight:700; margin-bottom:2px; }

        .typing-row{ display:flex; gap:9px; align-items:center; }
        .typing-bubble{
          background:var(--surface); border:1px solid var(--border); border-radius:16px;
          border-bottom-left-radius:4px; padding:9px 13px; display:flex; align-items:center; gap:8px;
        }
        .blip{ width:60px; height:16px; }
        .blip svg{ width:100%; height:100%; stroke:var(--primary); stroke-width:2; fill:none; stroke-linecap:round; stroke-linejoin:round; }
        .blip path{ stroke-dasharray:80; stroke-dashoffset:80; animation:draw 1.1s ease-in-out infinite; }
        @keyframes draw{ 0%{ stroke-dashoffset:80; } 60%{ stroke-dashoffset:0; } 100%{ stroke-dashoffset:-80; } }
        .typing-label{ font-size:12px; color:var(--ink-soft); }

        .composer{
          display:flex; gap:10px; align-items:flex-end; padding:12px 16px 16px;
          border-top:1px solid var(--border); background:var(--surface); flex-shrink:0;
        }
        .composer textarea{
          flex:1; resize:none; border:1px solid var(--border); border-radius:14px;
          padding:11px 13px; font-size:14.5px; font-family:inherit; color:var(--ink);
          max-height:120px; min-height:44px; background:var(--bg);
        }
        .composer textarea:focus{ outline:2px solid var(--primary); outline-offset:1px; background:var(--surface); }
        .send-btn{
          width:44px; height:44px; border-radius:12px; border:none; background:var(--primary);
          display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
        }
        .send-btn:disabled{ background:var(--ink-faint); cursor:not-allowed; }
        .send-btn svg{ width:19px; height:19px; stroke:#fff; fill:none; stroke-width:2.3; stroke-linecap:round; stroke-linejoin:round; }
        .footer-note{ text-align:center; font-size:11px; color:var(--ink-faint); padding-bottom:10px; }

        @media (min-width:880px){
          .sidebar{ position:relative; transform:none; box-shadow:none; }
          .backdrop{ display:none !important; }
          .icon-btn.menu{ display:none; }
        }
        @media (max-width:520px){
          .bubble{ max-width:88%; }
          .header-sub{ display:none; }
        }
      `}</style>

      <PulseStrip fast={loading} />

      <div className="shell">
        <div className={"backdrop" + (sidebarOpen ? " show" : "")} onClick={() => setSidebarOpen(false)} />
        <aside className={"sidebar" + (sidebarOpen ? " open" : "")}>
          <div className="brand">
            <PulseAvatar />
            <div>
              <div className="brand-name">{t.appName}</div>
              <div className="brand-tag">{t.tagline}</div>
            </div>
          </div>

          <button className="btn-new" onClick={newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            {t.newChat}
          </button>

          <div>
            <div className="section-label">{t.topics}</div>
            <div className="topics">
              {CATEGORIES.map((c) => (
                <button key={c.en} className="topic-chip" onClick={() => onTopicClick(c)}>
                  {lang === "hi" ? c.hi : c.en}
                </button>
              ))}
            </div>
          </div>

          <div className="side-spacer" />

          <div className="care-card emergency">
            <div className="care-title">{t.emergencyTitle}</div>
            <div className="care-body">{t.emergencyBody}</div>
          </div>
          <div className="care-card mental">
            <div className="care-title">{t.mentalHealthTitle}</div>
            <div className="care-body">{t.mentalHealthBody}</div>
          </div>
        </aside>

        <div className="main">
          <div className="header">
            <button className="icon-btn menu" onClick={() => setSidebarOpen((v) => !v)} aria-label="menu">
              <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
            <div className="header-mid">
              <div className="header-title">{t.appName}</div>
              <div className="header-sub">{t.tagline}</div>
            </div>
            <div className="lang-toggle" role="group" aria-label={t.langLabel}>
              <button className={"lang-opt" + (lang === "en" ? " active" : "")} onClick={() => setLang("en")}>EN</button>
              <button className={"lang-opt" + (lang === "hi" ? " active" : "")} onClick={() => setLang("hi")}>हिं</button>
            </div>
          </div>

          <div className="disclaimer-bar">{t.disclaimer}</div>

          <div className="thread" ref={scrollRef}>
            {messages.length === 1 && (
              <div className="empty-hint">{t.emptyHint}</div>
            )}
            {messages.map((m, i) => {
              if (m.role === "flag") {
                return (
                  <div className="flag-row" key={i}>
                    <div className="flag-card">
                      <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
                      <div>
                        <div className="flag-title">{t.emergencyTitle}</div>
                        <div>{t.emergencyBody}</div>
                        {m.crisis && (
                          <div style={{ marginTop: 4 }}>{t.mentalHealthBody}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className={"row " + m.role} key={i}>
                  {m.role === "assistant" && <PulseAvatar />}
                  <div>
                    <div className="bubble">{m.text}</div>
                    <div className="meta">{m.role === "user" ? t.you : t.assistant} · {m.time}</div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="typing-row">
                <PulseAvatar />
                <div className="typing-bubble">
                  <div className="blip">
                    <svg viewBox="0 0 60 16"><path d="M0,8 L14,8 L18,2 L24,14 L28,4 L32,8 L60,8"/></svg>
                  </div>
                  <span className="typing-label">{t.thinking}…</span>
                </div>
              </div>
            )}
          </div>

          <div className="composer">
            <textarea
              rows={1}
              value={input}
              placeholder={t.placeholder}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()} aria-label={t.send}>
              <svg viewBox="0 0 24 24"><path d="m3 3 18 9-18 9 4-9-4-9Z"/></svg>
            </button>
          </div>
          <div className="footer-note">{t.footerNote}</div>
        </div>
      </div>
    </div>
  );
}

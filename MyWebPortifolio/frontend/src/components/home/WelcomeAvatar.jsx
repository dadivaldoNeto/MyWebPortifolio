import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "../../styles/welcome-avatar.css";

const MESSAGES = [
  { text: "Ei, seja bem-vindo! 👋", delay: 3200 },
  { text: "Sou o Bruno — dev backend apaixonado por Java e Spring Boot.", delay: 3800 },
  { text: "Aqui você vai encontrar arquitetura limpa, APIs robustas e código que escala. 🏗️", delay: 4200 },
  { text: "Dica: explore a aba Skills para ver minha stack completa. ☕", delay: 3800 },
  { text: "Clean Code não é opcional. É responsabilidade. 🧹", delay: 3600 },
  { text: "Se quiser conversar sobre tech, é só me chamar no LinkedIn! 🚀", delay: 4000 },
];

const TypedText = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, 28);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}{!done && <span className="wv-cursor">|</span>}</span>;
};

const AvatarSVG = ({ waving, blinking, typing }) => (
  <svg className="wv-avatar-svg" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="wvGlow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="wvSoftGlow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="wvScreenGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#0d2818"/>
        <stop offset="100%" stopColor="#050f08"/>
      </radialGradient>
      <linearGradient id="wvBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a2e1f"/>
        <stop offset="100%" stopColor="#0f172a"/>
      </linearGradient>
      <linearGradient id="wvChairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1a2e"/>
        <stop offset="100%" stopColor="#0a0a1a"/>
      </linearGradient>
      <linearGradient id="wvDeskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#243040"/>
        <stop offset="100%" stopColor="#151e2a"/>
      </linearGradient>
      <radialGradient id="wvAmbient" cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="#4ade80" stopOpacity="0"/>
      </radialGradient>
    </defs>

    {/* Ambient glow from screen */}
    <ellipse cx="70" cy="90" rx="65" ry="50" fill="url(#wvAmbient)"/>

    {/* ===== MONITOR ===== */}
    {/* Stand */}
    <rect x="64" y="62" width="12" height="14" rx="2" fill="#1a2535" stroke="#2d3f55" strokeWidth="0.8"/>
    <rect x="54" y="74" width="32" height="5" rx="2.5" fill="#1a2535" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Outer frame */}
    <rect x="20" y="8" width="100" height="58" rx="6" fill="#0e1520" stroke="#2d3f55" strokeWidth="1.2"/>
    {/* Screen */}
    <rect x="24" y="12" width="92" height="50" rx="3" fill="url(#wvScreenGrad)"/>
    {/* Screen scanlines effect */}
    {[14,18,22,26,30,34,38,42,46,50,54,58].map((y,i) => (
      <rect key={i} x="24" y={y} width="92" height="0.5" fill="rgba(74,222,128,0.03)"/>
    ))}

    {/* === CODE LINES === */}
    <text x="28" y="21" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#818cf8">@RestController</text>
    <text x="28" y="27" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#60a5fa">public class </text>
    <text x="83" y="27" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#34d399">ApiController</text>
    <text x="28" y="33" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#818cf8">  @GetMapping</text>
    <text x="72" y="33" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#e2e8f0">("/status")</text>
    <text x="28" y="39" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#60a5fa">  public </text>
    <text x="57" y="39" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#fbbf24">String</text>
    <text x="74" y="39" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#e2e8f0"> ok() {"{"}</text>
    <text x="28" y="45" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#60a5fa">    return </text>
    <text x="57" y="45" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#f472b6">"200 OK ✓"</text>
    <text x="28" y="51" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#e2e8f0">  {"}"}</text>
    <text x="28" y="57" fontFamily="'JetBrains Mono',monospace" fontSize="4.5" fill="#e2e8f0">{"}"}</text>

    {/* Typing cursor */}
    {typing && (
      <rect x="57" y="48" width="2.5" height="5" rx="0.5" fill="#4ade80" filter="url(#wvGlow)"/>
    )}

    {/* Screen top reflection */}
    <rect x="24" y="12" width="92" height="4" rx="1" fill="rgba(255,255,255,0.025)"/>
    {/* Monitor bottom bar */}
    <rect x="20" y="63" width="100" height="5" rx="2" fill="#1a2535" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Power LED */}
    <circle cx="70" cy="65.5" r="1.5" fill="#4ade80" filter="url(#wvGlow)" opacity="0.9"/>

    {/* ===== DESK ===== */}
    <rect x="4" y="120" width="132" height="9" rx="4" fill="url(#wvDeskGrad)" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Desk edge highlight */}
    <rect x="4" y="120" width="132" height="1.5" rx="1" fill="rgba(255,255,255,0.06)"/>

    {/* ☕ Coffee mug */}
    <rect x="108" y="108" width="13" height="12" rx="3" fill="#1e293b" stroke="#4ade80" strokeWidth="0.8"/>
    <path d="M121 111 Q127 111 127 114 Q127 117 121 117" stroke="#4ade80" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <rect x="109" y="109" width="11" height="4" rx="1" fill="rgba(74,222,128,0.15)"/>
    <text x="111" y="118" fontFamily="sans-serif" fontSize="5" fill="#4ade80">☕</text>
    {/* Steam wisps */}
    <path d="M112 107 Q114 103 112 100" stroke="#4ade80" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5"/>
    <path d="M117 106 Q119 102 117 99" stroke="#4ade80" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.35"/>

    {/* Keyboard */}
    <rect x="42" y="112" width="60" height="9" rx="2.5" fill="#141e2e" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Key rows */}
    {[44,48,52,56,60,64,68,72,76,80,84,88,92,96].map((x,i) => (
      <rect key={`k1-${i}`} x={x} y="113.5" width="3.5" height="2.5" rx="0.8" fill="#0a1018" stroke="#334155" strokeWidth="0.3"/>
    ))}
    {[45,49,53,57,61,65,69,73,77,81,85,89,93].map((x,i) => (
      <rect key={`k2-${i}`} x={x} y="117" width="3.5" height="2.5" rx="0.8" fill="#0a1018" stroke="#334155" strokeWidth="0.3"/>
    ))}
    {/* WASD keys green highlight */}
    <rect x="53" y="113.5" width="3.5" height="2.5" rx="0.8" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="0.4"/>
    <rect x="48" y="117" width="3.5" height="2.5" rx="0.8" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="0.4"/>
    <rect x="52" y="117" width="3.5" height="2.5" rx="0.8" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="0.4"/>
    <rect x="56" y="117" width="3.5" height="2.5" rx="0.8" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="0.4"/>

    {/* ===== CHAIR ===== */}
    {/* Chair back */}
    <rect x="30" y="128" width="80" height="38" rx="10" fill="url(#wvChairGrad)" stroke="#2d3f55" strokeWidth="1"/>
    <rect x="38" y="134" width="64" height="26" rx="6" fill="rgba(74,222,128,0.03)" stroke="rgba(74,222,128,0.1)" strokeWidth="0.8"/>
    {/* Chair headrest */}
    <rect x="42" y="124" width="56" height="14" rx="7" fill="#1a1a2e" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Chair seat */}
    <rect x="26" y="164" width="88" height="14" rx="6" fill="url(#wvChairGrad)" stroke="#2d3f55" strokeWidth="1"/>
    {/* Chair armrests */}
    <rect x="16" y="155" width="16" height="8" rx="4" fill="#1a1a2e" stroke="#2d3f55" strokeWidth="0.8"/>
    <rect x="108" y="155" width="16" height="8" rx="4" fill="#1a1a2e" stroke="#2d3f55" strokeWidth="0.8"/>
    {/* Chair accent line */}
    <rect x="38" y="164" width="64" height="1.5" rx="1" fill="rgba(74,222,128,0.15)"/>

    {/* ===== CHARACTER ===== */}
    {/* Left arm (static on desk) */}
    <rect x="18" y="100" width="18" height="30" rx="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8"/>
    {/* Left hand on keyboard */}
    <ellipse cx="27" cy="132" rx="9" ry="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6"/>
    {/* Left fingers */}
    <ellipse cx="20" cy="127" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
    <ellipse cx="26" cy="125" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
    <ellipse cx="32" cy="126" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>

    {/* Right arm */}
    <g style={{
      transformOrigin: "104px 100px",
      transform: waving ? "rotate(-40deg)" : "rotate(0deg)",
      transition: "transform 0.15s ease",
    }}>
      <rect x="104" y="100" width="18" height="30" rx="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8"/>
      {/* Right hand */}
      <ellipse cx="113" cy="132" rx="9" ry="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6"/>
      {/* Waving fingers */}
      <ellipse cx="106" cy="127" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
      <ellipse cx="112" cy="125" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
      <ellipse cx="118" cy="127" rx="4" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
    </g>

    {/* Body / hoodie */}
    <rect x="34" y="88" width="72" height="50" rx="14" fill="url(#wvBodyGrad)" stroke="rgba(74,222,128,0.3)" strokeWidth="1.2"/>
    {/* Hoodie pocket */}
    <rect x="48" y="108" width="44" height="24" rx="8" fill="#0f1a15" stroke="#1e3a2f" strokeWidth="0.8"/>
    {/* </> symbol on pocket */}
    <text x="70" y="123" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#4ade80" filter="url(#wvGlow)" fontWeight="bold">{"</>"}</text>
    {/* Hoodie zip line */}
    <line x1="70" y1="90" x2="70" y2="108" stroke="rgba(74,222,128,0.25)" strokeWidth="1" strokeDasharray="2,2"/>
    {/* Collar neon */}
    <path d="M52 88 L70 100 L88 88" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#wvGlow)"/>

    {/* Neck */}
    <rect x="58" y="74" width="24" height="18" rx="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6"/>

    {/* ===== HEAD ===== */}
    <rect x="34" y="30" width="72" height="52" rx="24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8"/>
    {/* Hair */}
    <path d="M34 46 Q36 24 70 22 Q104 24 106 46 Q100 30 70 28 Q40 30 34 46Z" fill="#1e293b"/>
    {/* Hair side detail */}
    <path d="M34 46 Q30 38 34 34 Q36 30 38 34" fill="#1e293b"/>
    <path d="M106 46 Q110 38 106 34 Q104 30 102 34" fill="#1e293b"/>

    {/* Sunglasses */}
    <rect x="38" y="47" width="26" height="16" rx="5" fill="#0a0f1a" stroke="#4ade80" strokeWidth="1.2"/>
    <rect x="76" y="47" width="26" height="16" rx="5" fill="#0a0f1a" stroke="#4ade80" strokeWidth="1.2"/>
    {/* Glasses bridge */}
    <line x1="64" y1="55" x2="76" y2="55" stroke="#4ade80" strokeWidth="1.2" filter="url(#wvGlow)"/>
    {/* Glasses arms */}
    <line x1="38" y1="55" x2="34" y2="53" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="102" y1="55" x2="106" y2="53" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Glasses lens sheen */}
    <rect x="40" y="49" width="8" height="4" rx="2" fill="rgba(74,222,128,0.15)"/>
    <rect x="78" y="49" width="8" height="4" rx="2" fill="rgba(74,222,128,0.15)"/>
    {/* Glasses glow line */}
    <rect x="38" y="47" width="26" height="2" rx="1" fill="rgba(74,222,128,0.2)"/>
    <rect x="76" y="47" width="26" height="2" rx="1" fill="rgba(74,222,128,0.2)"/>

    {/* Smile / smirk */}
    <path d="M56 70 Q70 80 84 70" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* Dimples */}
    <circle cx="55" cy="68" r="1.5" fill="rgba(0,0,0,0.12)"/>
    <circle cx="85" cy="68" r="1.5" fill="rgba(0,0,0,0.12)"/>

    {/* ===== HEADPHONES ===== */}
    <path d="M34 52 Q34 24 70 22 Q106 24 106 52" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M34 52 Q34 24 70 22 Q106 24 106 52" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#wvGlow)"/>
    {/* Left ear cup */}
    <rect x="26" y="48" width="14" height="20" rx="7" fill="#1a2535" stroke="#4ade80" strokeWidth="1.5" filter="url(#wvGlow)"/>
    <rect x="29" y="52" width="8" height="12" rx="4" fill="#0a0f1a"/>
    <circle cx="33" cy="58" r="2.5" fill="#4ade80" opacity="0.6" filter="url(#wvGlow)"/>
    {/* Right ear cup */}
    <rect x="100" y="48" width="14" height="20" rx="7" fill="#1a2535" stroke="#4ade80" strokeWidth="1.5" filter="url(#wvGlow)"/>
    <rect x="103" y="52" width="8" height="12" rx="4" fill="#0a0f1a"/>
    <circle cx="107" cy="58" r="2.5" fill="#4ade80" opacity="0.6" filter="url(#wvGlow)"/>

    {/* Headphone LED strip */}
    <path d="M34 44 Q34 26 70 24 Q106 26 106 44" stroke="rgba(74,222,128,0.4)" strokeWidth="1" fill="none" strokeDasharray="3,3"/>

    {/* ===== GROUND SHADOW ===== */}
    <ellipse cx="70" cy="178" rx="50" ry="6" fill="rgba(0,0,0,0.35)"/>
  </svg>
);

const WelcomeAvatar = ({ allowClose = true }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [waving, setWaving] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [typing, setTyping] = useState(true);
  const [position, setPosition] = useState({ x: null, y: null });
  const [bubbleKey, setBubbleKey] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const timerRef = useRef(null);
  const wavingRef = useRef(null);
  const blinkRef = useRef(null);
  const typingRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const close = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (minimized) return;
    clearTimeout(timerRef.current);
    setBubbleKey((k) => k + 1);
    const msg = MESSAGES[msgIndex];
    timerRef.current = setTimeout(() => {
      if (msgIndex < MESSAGES.length - 1) setMsgIndex((i) => i + 1);
      else setTimeout(close, 1200);
    }, msg.delay);
    return () => clearTimeout(timerRef.current);
  }, [msgIndex, minimized, close]);

  useEffect(() => {
    setWaving(true);
    clearTimeout(wavingRef.current);
    wavingRef.current = setTimeout(() => setWaving(false), 1200);
  }, [msgIndex]);

  // Typing cursor blink
  useEffect(() => {
    const doTyping = () => {
      setTyping(t => !t);
      typingRef.current = setTimeout(doTyping, 600);
    };
    typingRef.current = setTimeout(doTyping, 600);
    return () => clearTimeout(typingRef.current);
  }, []);

  const onMouseDown = (e) => {
    if (e.target.closest("button")) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const onMouseUp = () => {
    dragRef.current.dragging = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  if (!visible) return null;

  const posStyle = position.x !== null
    ? { left: position.x, top: position.y, bottom: "auto", right: "auto" }
    : {};

  return createPortal(
    <div
      ref={containerRef}
      className={`wv-container ${minimized ? "wv-container--mini" : ""}`}
      style={posStyle}
      onMouseDown={onMouseDown}
    >
      {allowClose && (
        <button className="wv-btn wv-btn--close" onClick={close} title="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      <button
        className="wv-btn wv-btn--mini"
        onClick={() => setMinimized((m) => !m)}
        title={minimized ? "Expandir" : "Minimizar"}
      >
        {minimized ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </button>

      {!minimized && (
        <div className="wv-bubble-wrap" key={bubbleKey}>
          <div className="wv-bubble">
            <div className="wv-bubble-bar" />
            <p className="wv-bubble-text">
              <TypedText text={MESSAGES[msgIndex].text} />
            </p>
            <div className="wv-bubble-dots">
              {MESSAGES.map((_, i) => (
                <span key={i} className={`wv-dot ${i === msgIndex ? "wv-dot--active" : ""}`} />
              ))}
            </div>
          </div>
          <div className="wv-bubble-tail" />
        </div>
      )}

      <div className={`wv-avatar-wrap ${minimized ? "wv-avatar-wrap--mini" : ""}`}>
        <div className="wv-avatar-glow" />
        <AvatarSVG waving={waving} blinking={blinking} typing={typing} />
        {minimized && <span className="wv-mini-ping" />}
      </div>
    </div>,
    document.body
  );
};

export default WelcomeAvatar;
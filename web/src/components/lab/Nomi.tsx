/** Small code-native character; no images, downloads or external font needed. */
export function Nomi({ mood = "happy", className = "" }: { mood?: "happy" | "thinking" | "listening"; className?: string }) {
  return (
    <svg viewBox="0 0 260 260" role="img" aria-label={`Nomi robot — ${mood === "happy" ? "xursand" : mood === "thinking" ? "o‘ylanmoqda" : "tinglamoqda"}`} className={`nomi nomi--${mood} ${className}`}>
      <ellipse cx="130" cy="236" rx="63" ry="10" fill="#ddd9f0" />
      <g className="nomi-float">
        <path d="M130 55V32" stroke="#8b7cc8" strokeWidth="7" strokeLinecap="round" />
        <circle cx="130" cy="27" r="10" fill="#7ddad7" stroke="#fff" strokeWidth="4" />
        <rect x="32" y="89" width="20" height="45" rx="10" fill="#9c8fe2" />
        <rect x="208" y="89" width="20" height="45" rx="10" fill="#9c8fe2" />
        <rect x="45" y="52" width="170" height="120" rx="42" fill="#ece9fa" stroke="#b8acec" strokeWidth="3" />
        <path d="M66 76Q82 59 113 61" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="64" y="74" width="132" height="75" rx="28" fill="#272544" />
        <g fill="#9ff4e6" className="nomi-eyes">
          {mood === "happy" ? <><path d="M86 109q12-20 24 0" fill="none" stroke="#9ff4e6" strokeWidth="7" strokeLinecap="round" /><path d="M149 109q12-20 24 0" fill="none" stroke="#9ff4e6" strokeWidth="7" strokeLinecap="round" /></> : <><rect x="91" y="94" width="15" height={mood === "thinking" ? "15" : "23"} rx="7" /><rect x="153" y="94" width="15" height="23" rx="7" /></>}
        </g>
        <path d={mood === "thinking" ? "M123 130h14" : "M120 126q10 10 20 0"} stroke="#9ff4e6" strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="83" cy="125" rx="9" ry="4" fill="#df95c2" opacity=".7" /><ellipse cx="177" cy="125" rx="9" ry="4" fill="#df95c2" opacity=".7" />
        <rect x="84" y="169" width="92" height="55" rx="22" fill="#ece9fa" stroke="#b8acec" strokeWidth="3" />
        <rect x="105" y="179" width="50" height="25" rx="12" fill="white" />
        <path d="m125 185 12 6-12 6z" fill="#8c75dd" />
        <path d="M84 184q-23 5-31-12M176 184q20-5 29-25" stroke="#b8acec" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M107 224v7M153 224v7" stroke="#8c7dbd" strokeWidth="12" strokeLinecap="round" />
      </g>
      <path d="m218 38 3 8 8 3-8 3-3 8-3-8-8-3 8-3zM26 164l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#b7a2ee" />
    </svg>
  );
}

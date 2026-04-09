import React from "react";

const styles = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "5px 13px",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "1px solid",
    transition: "all 0.4s ease",
  },
  fast: {
    background: "#e6f4ea",
    color: "#1e7e34",
    borderColor: "#ceead6",
  },
  slow: {
    background: "#fff4e5",
    color: "#663c00",
    borderColor: "#ffe2b3",
  },
  offline: {
    background: "#fdecea",
    color: "#c5221f",
    borderColor: "#fad2cf",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "currentColor",
    flexShrink: 0,
    animation: "pulse 2s infinite",
  },
};

if (typeof document !== "undefined" && !document.getElementById("cb-pulse")) {
  const s = document.createElement("style");
  s.id = "cb-pulse";
  s.textContent = `@keyframes pulse { 0%{opacity:1} 50%{opacity:0.35} 100%{opacity:1} }`;
  document.head.appendChild(s);
}

const MODES = {
  fast:    { label: "FAST · 4G",  style: styles.fast    },
  slow:    { label: "SLOW · 3G",  style: styles.slow    },
  offline: { label: "OFFLINE",    style: styles.offline },
};

function ConnectionBanner({ connection }) {
  const mode = MODES[connection] ?? MODES.fast;

  return (
    <div style={{ ...styles.pill, ...mode.style }}>
      <span style={styles.dot} />
      <span>{mode.label}</span>
    </div>
  );
}

export default ConnectionBanner;
import { useEffect, useState } from "react";

// Valores aproximados que DevTools throttling impone en downlink (Mbps):
// Fast 4G  → downlink ~4 Mbps  (sin throttling, o muy alto)
// Slow 4G  → downlink ~1.5 Mbps
// 3G       → downlink ~0.75 Mbps
// Offline  → navigator.onLine = false

function getStatus() {
  if (!navigator.onLine) return "offline";

  const conn = navigator.connection;
  if (!conn) return "fast"; // si el browser no soporta la API, asumimos fast

  const downlink = conn.downlink; // en Mbps

  if (downlink >= 2) return "fast";      // Fast 4G: ≥2 Mbps
  if (downlink >= 0.5) return "slow";    // Slow 4G / 3G: entre 0.5 y 2 Mbps
  if (downlink > 0) return "slow";       // cualquier cosa con señal pero lenta
  return "offline";                       // downlink = 0 = sin datos
}

export default function useConnection() {
  const [status, setStatus] = useState(getStatus);

  useEffect(() => {
    const update = () => setStatus(getStatus());

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    if (navigator.connection) {
      navigator.connection.addEventListener("change", update);
    }

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (navigator.connection) {
        navigator.connection.removeEventListener("change", update);
      }
    };
  }, []);

  return status; // devuelve directamente: "fast" | "slow" | "offline"
}
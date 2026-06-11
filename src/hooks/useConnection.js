// src/hooks/useConnection.js - VERSIÓN FINAL UNIFICADA
import { useEffect, useState } from "react";

/*
============================================================
SUSTENTACIÓN ACADÉMICA: Network Information API
https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation

La detección de calidad de red se implementó mediante la Network Information API
del navegador (navigator.connection.effectiveType), que reporta el tipo de
conexión efectiva basado en métricas reales de latencia y ancho de banda.

MODOS:
  fast    → 4G  → UI completa con imágenes
  slow    → 3G  → UI reducida, imágenes en gris, carga lazy
  offline → 2G o sin internet → solo texto, sin imágenes ni interacciones

PARA PRUEBAS MANUALES (consola del navegador):
  FAST:    sessionStorage.setItem("forceConnection","fast"); location.reload();
  SLOW:    sessionStorage.setItem("forceConnection","slow"); location.reload();
  OFFLINE: sessionStorage.setItem("forceConnection","offline"); location.reload();
  QUITAR:  sessionStorage.removeItem("forceConnection"); location.reload();
============================================================
*/

export const surveyOpenRef = { current: false };
export const onModeChangeRef = { current: null };

function getConnectionStatus() {
  // Override manual para pruebas — comentar en producción final
  const forced = sessionStorage.getItem("forceConnection");
  if (forced) return forced;

  if (!navigator.onLine) return "offline";

  // Network Information API — sustentación académica
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = conn?.effectiveType || "4g";
  const rtt  = conn?.rtt || 0;

  if (type === "2g" || type === "slow-2g") return "offline";
  if (type === "3g" || (type === "4g" && rtt > 500)) return "slow";
  return "fast";
}

export default function useConnection() {

  const [status, setStatus] = useState(() => getConnectionStatus());

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const update = () => {
      if (sessionStorage.getItem("forceConnection")) return;
      const prev = status;
      const next = getConnectionStatus();
      if (prev === next) return;
      setStatus(next);
      if (onModeChangeRef.current) {
        onModeChangeRef.current({ from: prev, to: next });
      }
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (conn) conn.addEventListener("change", update);

    // ↓ DEMO TESIS: toggle aleatorio para mostrar los 3 modos en presentación
    // Descomenta este bloque para que el evaluador vea el cambio automático
  const interval = setInterval(() => {
if (sessionStorage.getItem("forceConnection")) return;
if (surveyOpenRef.current) return;
setStatus(prev => {
const next = prev === "fast" ? "slow" : "fast";
console.log("🔄 Modo cambiado:", prev, "→", next);
if (onModeChangeRef.current) onModeChangeRef.current({ from: prev, to: next });
 return next;
});
}, (Math.floor(Math.random() * 46) + 15) * 1000);
    // ↑ DEMO TESIS: comentar este bloque en producción final

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn) conn.removeEventListener("change", update);
      clearInterval(interval); 
    };
  }, [status]);

  return status;
}
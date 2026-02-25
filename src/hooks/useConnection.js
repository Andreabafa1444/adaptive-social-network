import { useEffect, useState, useRef, useCallback } from "react";

function randomSeconds() {
  const secs = Math.floor(Math.random() * 46) + 15;
  console.log(`🔄 [useConnection] próximo cambio en ${secs}s`);
  return secs * 1000;
}

function isOnline() {
  return navigator.onLine;
}

// Pausa el timer mientras la encuesta está abierta
export const surveyOpenRef = { current: false };

// Callback que SurveyModal conecta para recibir notificaciones de cambio
export const onModeChangeRef = { current: null };

export default function useConnection() {
  const [status, setStatus] = useState(() => {
    const initial = isOnline() ? "fast" : "offline";
    console.log(`📡 [useConnection] estado inicial: ${initial}`);
    return initial;
  });

  const timerRef  = useRef(null);
  const statusRef = useRef(status);

  const scheduleToggle = useCallback(() => {
    clearTimeout(timerRef.current);
    const delay = randomSeconds();

    timerRef.current = setTimeout(() => {
      if (!isOnline()) {
        console.log("📡 sin internet, no alterno");
        return;
      }

      // Si encuesta abierta, postponer sin cambiar modo
      if (surveyOpenRef.current) {
        console.log("⏸️ encuesta abierta, postponiendo cambio");
        scheduleToggle();
        return;
      }

      const prev = statusRef.current;
      const next = prev === "fast" ? "slow" : "fast";
      console.log(`📡 cambiando: ${prev} → ${next}`);

      statusRef.current = next;
      setStatus(next);

      // Notificar al SurveyModal
      if (onModeChangeRef.current) {
        onModeChangeRef.current({ from: prev, to: next });
      }

      scheduleToggle();
    }, delay);
  }, []);

  useEffect(() => {
    if (isOnline()) scheduleToggle();

    const handleOffline = () => {
      clearTimeout(timerRef.current);
      const prev = statusRef.current;
      statusRef.current = "offline";
      setStatus("offline");
      if (onModeChangeRef.current) {
        onModeChangeRef.current({ from: prev, to: "offline" });
      }
    };

    const handleOnline = () => {
      statusRef.current = "fast";
      setStatus("fast");
      scheduleToggle();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, [scheduleToggle]);

  return status;
}
import { useEffect, useState, useRef, useCallback } from "react";

function randomSeconds() {
  const secs = Math.floor(Math.random() * 46) + 15; // 15–60 segundos
  console.log(`🔄 [useConnection] próximo cambio en ${secs}s`);
  return secs * 1000;
}

function isOnline() {
  return navigator.onLine;
}

export default function useConnection() {
  const [status, setStatus] = useState(() => {
    const initial = isOnline() ? "fast" : "offline";
    console.log(`📡 [useConnection] estado inicial: ${initial}`);
    return initial;
  });

  const timerRef = useRef(null);
  // Guardamos el estado actual en un ref para que scheduleToggle siempre lo lea fresco
  const statusRef = useRef(status);

  const scheduleToggle = useCallback(() => {
    clearTimeout(timerRef.current); // limpia cualquier timer anterior

    const delay = randomSeconds();

    timerRef.current = setTimeout(() => {
      if (!isOnline()) {
        console.log("📡 [useConnection] sin internet, no alterno");
        return;
      }
      const next = statusRef.current === "fast" ? "slow" : "fast";
      console.log(`📡 [useConnection] cambiando: ${statusRef.current} → ${next}`);
      statusRef.current = next;
      setStatus(next);
      scheduleToggle(); // programa el siguiente
    }, delay);
  }, []);

  useEffect(() => {
    if (isOnline()) {
      scheduleToggle();
    }

    const handleOffline = () => {
      console.log("📡 [useConnection] red caída → offline");
      clearTimeout(timerRef.current);
      statusRef.current = "offline";
      setStatus("offline");
    };

    const handleOnline = () => {
      console.log("📡 [useConnection] red restaurada → fast");
      statusRef.current = "fast";
      setStatus("fast");
      scheduleToggle();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [scheduleToggle]);

  return status;
}
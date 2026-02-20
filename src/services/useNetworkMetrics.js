import { useState, useEffect } from "react";

export function useNetworkMetrics() {
  const [network, setNetwork] = useState({
    online: navigator.onLine,
    status: "fast", // fast, unstable, critical
    type: navigator.connection?.effectiveType || "4g"
  });

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const updateStatus = () => {
      const type = conn?.effectiveType || "4g";
      const rtt = conn?.rtt || 0;
      let newStatus = "fast";

      // LÓGICA DE TESIS: Forzamos la detección
      if (!navigator.onLine || type === "2g") {
        newStatus = "critical";
      } else if (type === "3g" || rtt > 500) {
        newStatus = "unstable";
      }

      console.log(`📡 Cambio de Red: Tipo=${type}, RTT=${rtt}, Status=${newStatus}`);
      
      setNetwork({
        online: navigator.onLine,
        type: type,
        status: newStatus
      });
    };

    if (conn) conn.addEventListener("change", updateStatus);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      if (conn) conn.removeEventListener("change", updateStatus);
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return network;
}
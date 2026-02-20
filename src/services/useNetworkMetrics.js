import { useState, useEffect } from "react";

export function useNetworkMetrics() {
  const [network, setNetwork] = useState({
    online: navigator.onLine,
    status: navigator.onLine ? "fast" : "critical", 
    type: navigator.connection?.effectiveType || "4g"
  });

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const updateStatus = () => {
      const isOnline = window.navigator.onLine; 
      const type = conn?.effectiveType || "4g";
      const rtt = conn?.rtt || 0;
      
      let newStatus = "fast";

      // LÓGICA DE TESIS: 3G DEBE SER INTERMEDIO
      if (!isOnline || type === "2g" || type === "slow-2g") {
        newStatus = "critical"; // Aquí es donde NO se ven imágenes
      } 
      else if (type === "3g" || (type === "4g" && rtt > 500)) {
        newStatus = "unstable"; // Aquí SÍ se ven imágenes (Intermedio)
      }
      else {
        newStatus = "fast"; 
      }

      console.log(`📡 Detector: Online=${isOnline} | Tipo=${type} | Status=${newStatus}`);
      
      setNetwork({
        online: isOnline,
        type: type,
        status: newStatus
      });
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    if (conn) conn.addEventListener("change", updateStatus);

    updateStatus(); 

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (conn) conn.removeEventListener("change", updateStatus);
    };
  }, []);

  return network;
}
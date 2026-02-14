import { useEffect, useState } from "react";

export default function useConnection() {
  const [status, setStatus] = useState({
    online: navigator.onLine,
    type: "unknown"
  });

  useEffect(() => {
    const updateConnection = () => {
      let connectionType = "unknown";

      if (navigator.connection && navigator.connection.effectiveType) {
        connectionType = navigator.connection.effectiveType;
      }

      setStatus({
        online: navigator.onLine,
        type: connectionType
      });
    };

    updateConnection();

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    if (navigator.connection) {
      navigator.connection.addEventListener("change", updateConnection);
    }

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      if (navigator.connection) {
        navigator.connection.removeEventListener("change", updateConnection);
      }
    };
  }, []);

  return status;
}

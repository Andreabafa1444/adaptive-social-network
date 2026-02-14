import "../styles/connection.css";

function ConnectionBanner({ connection }) {
  if (!connection) return null;

  return (
    <div
      className={`connection-banner ${
        connection.online ? "online" : "offline"
      }`}
    >
      <span className="connection-dot"></span>

      {connection.online
        ? connection.type === "2g"
          ? "Conexión lenta"
          : "Conexión estable"
        : "Sin conexión"}
    </div>
  );
}

export default ConnectionBanner;

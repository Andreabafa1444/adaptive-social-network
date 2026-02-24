import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Feed from "../components/Feed";
import ConnectionBanner from "../components/ConnectionBanner";
import useConnection from "../hooks/useConnection";
import "../styles/feed.css";

function FeedPage() {
  const navigate = useNavigate();
  const { online, type } = useConnection(); // ← destructuramos el objeto

  // Convertimos a un string limpio de 3 estados para todos los hijos
  // DevTools throttling devuelve: "4g", "3g", "2g", "slow-2g"
  const connectionStatus = !online
    ? "offline"
    : type === "4g" || type === "unknown"
    ? "fast"
    : "slow"; // cubre "3g", "2g", "slow-2g"

  return (
    <div className="feed-wrapper">
      <Navbar />
      <div className="feed-container">

        {/* Pasamos el string limpio, no el objeto */}
        <ConnectionBanner connection={connectionStatus} />

        <div className="create-button-container">
          <button onClick={() => navigate("/create")} className="create-post-btn">
            + Crear publicación
          </button>
        </div>

        <Feed connection={connectionStatus} />

      </div>
    </div>
  );
}

export default FeedPage;
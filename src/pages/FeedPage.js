import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Feed from "../components/Feed";
import ConnectionBanner from "../components/ConnectionBanner";
import useConnection from "../hooks/useConnection";
import "../styles/feed.css";

function FeedPage() {
  const navigate = useNavigate();
  // ✅ useConnection devuelve string directo: "fast" | "slow" | "offline"
  // NO destructurar como objeto — eso daría online=undefined → siempre "offline"
  const connection = useConnection();

  return (
    <div className="feed-wrapper">
      <Navbar />
      <div className="feed-container">

        <ConnectionBanner connection={connection} />

        <div className="create-button-container">
          <button onClick={() => navigate("/create")} className="create-post-btn">
            + Crear publicación
          </button>
        </div>

        <Feed connection={connection} />

      </div>
    </div>
  );
}

export default FeedPage;
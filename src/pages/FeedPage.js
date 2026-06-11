import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Feed from "../components/Feed";
import ConnectionBanner from "../components/ConnectionBanner";
import "../styles/feed.css";
import { useConnectionContext } from "../context/ConnectionContext";

function FeedPage({ user, loading }) {        // ← quitado connection de aquí

  const navigate = useNavigate();
  const connection = useConnectionContext();  // ← única fuente

  return (
    <div className="feed-wrapper">
      <Navbar />
      <div className="feed-container">
        <ConnectionBanner connection={connection} />
        <div className="create-button-container lcp-anchor">
          <button 
            onClick={() => navigate("/create")}
            className="create-post-btn lcp-button"
          >
            + Crear publicación
          </button>
        </div>
        <Feed 
          connection={connection}
          user={user}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default FeedPage;
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Feed from "../components/Feed";
import ConnectionBanner from "../components/ConnectionBanner";
import useConnection from "../hooks/useConnection";
import "../styles/feed.css";

function FeedPage({ user, loading }) {

  const navigate = useNavigate();

  const connection = useConnection();

  return (

    <div className="feed-wrapper">

      <Navbar />

      <div className="feed-container">

        <ConnectionBanner connection={connection} />

        {/* ✅ LCP anchor element (esto ayuda Lighthouse) */}
        <div className="create-button-container lcp-anchor">

          <button 
            onClick={()=>navigate("/create")}
            className="create-post-btn lcp-button"
          >
            + Crear publicación
          </button>

        </div>

        {/* Feed real */}
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
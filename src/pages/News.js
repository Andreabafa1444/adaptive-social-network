import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/exploreApi";
import Navbar from "../components/NavBar";
import "../styles/News.css";

function News() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All");
  const [selectedNews, setSelectedNews] = useState(null); 
  const [connectionType, setConnectionType] = useState("full");

  useEffect(() => {
    fetchTopNews().then(data => {
      // Limpieza de duplicados por título para seguridad visual
      const uniqueData = Array.from(new Map(data.map(item => [item.title, item])).values());
      setArticles(uniqueData);
      setFilteredArticles(uniqueData);
    });

    const checkConnection = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!navigator.onLine) setConnectionType("offline");
      else if (conn && (conn.saveData || ["2g", "3g"].includes(conn.effectiveType))) setConnectionType("limited");
      else setConnectionType("full");
    };
    checkConnection();
  }, []);

  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    if (topic === "All") setFilteredArticles(articles);
    else setFilteredArticles(articles.filter(a => a.categories?.includes(topic)));
  };

  const topics = ["All", "Tecnología", "Política", "Negocios", "Cultura Pop", "Ciencia"];

  return (
    <div className={`news-page mode-${connectionType}`}>
      <Navbar />
      <div className="container">
        <header className="news-header">
          <div className="title-section">
            <h1>Explorar Mundo</h1>
            <div className={`connection-pill ${connectionType === 'offline' ? 'offline' : 'online'}`}>
              <div className="connection-dot"></div>
              {connectionType.toUpperCase()}
            </div>
          </div>
          <div className="topics-bar">
            {topics.map(t => (
              <button key={t} className={activeTopic === t ? "active" : ""} onClick={() => handleTopicChange(t)}>{t}</button>
            ))}
          </div>
        </header>

        <section className="feed-section">
          <h2>Popular Reading</h2>
          <div className="news-list-container">
            {filteredArticles.map((a, i) => (
              <article key={i} className="social-card-mini" onClick={() => setSelectedNews(a)}>
                <div className="card-image-box">
                  {connectionType !== "offline" && a.urlToImage && <img src={a.urlToImage} alt="news" />}
                </div>
                <div className="card-content-box">
                  <span className="source-label">{a.source?.name}</span>
                  <h3>{a.title}</h3>
                  <div className="card-footer-mini">
                    <span>{new Date(a.publishedAt).toLocaleDateString()}</span> • <span>5 min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL CON DISEÑO SOCIAL SOLICITADO */}
      {selectedNews && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal-content-social" onClick={e => e.stopPropagation()}>
            <button className="close-modal-social" onClick={() => setSelectedNews(null)}>×</button>
            
            <div className="modal-image-container">
              <img src={selectedNews.urlToImage} className="modal-img-social" alt="news" />
            </div>

            <div className="modal-body-social">
              <h1 className="modal-title-social">{selectedNews.title}</h1>
              <p className="modal-text-social">{selectedNews.description}</p>
              
              <div className="modal-divider"></div>

              <div className="modal-footer-social">
                <div className="interaction-item">
                  <span className="icon">❤️</span>
                  <span className="count">8.6K</span>
                </div>
                <div className="interaction-item">
                  <span className="icon">💬</span>
                  <span className="count">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default News;
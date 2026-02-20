import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/exploreApi"; // Nombre corregido
import Navbar from "../components/NavBar";

function News() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchTopNews().then(setArticles);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2 style={{marginTop: "20px"}}>Noticias globales</h2>
      <div className="news-grid">
        {articles.map((a, i) => (
          <div key={i} className="news-card-pro">
            <small>{a.source?.name}</small>
            <h3>{a.title}</h3>
            {a.urlToImage && <img src={a.urlToImage} alt="news" />}
            <p>{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
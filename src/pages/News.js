import { useEffect, useState } from "react";
import { fetchTopNews } from "../services/newsApi";
import Navbar from "../components/NavBar";

function News() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchTopNews().then(setArticles);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Noticias globales</h2>

      {articles.map((a, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "1.5rem"
          }}
        >
          {/* FUENTE + FECHA */}
          <small style={{ color: "#666" }}>
            {a.source?.name} ·{" "}
            {new Date(a.publishedAt).toLocaleDateString()}
          </small>

          {/* TÍTULO */}
          <h3 style={{ marginTop: "0.5rem" }}>{a.title}</h3>

          {/* IMAGEN */}
          {a.urlToImage && (
            <img
              src={a.urlToImage}
              alt=""
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "4px",
                margin: "0.5rem 0"
              }}
            />
          )}

          {/* DESCRIPCIÓN */}
          {a.description && <p>{a.description}</p>}

          {/* LINK */}
          <a href={a.url} target="_blank" rel="noreferrer">
            Leer noticia completa →
          </a>
        </div>
      ))}
    </div>
  );
}

export default News;

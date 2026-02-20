import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getTrendingNews } from "../services/exploreApi";
import PostCard from "../components/PostCard";
import Navbar from "../components/NavBar";
import "../styles/explore.css";

function Explorar({ connection }) {
  const [trending, setTrending] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get("search");

  useEffect(() => {
    const fetchTrends = async () => {
      const res = await getTrendingNews(process.env.REACT_APP_EXPLORE_API_KEY);
      if (res.status === "success") setTrending(res.data);
    };
    fetchTrends();
  }, [searchFromUrl]);

  useEffect(() => {
    const rawTerm = searchFromUrl || searchTerm;
    const term = rawTerm ? rawTerm.toLowerCase().trim() : "";

    if (term) {
      const q = query(collection(db, "posts"), where("tags", "array-contains", term));
      const unsub = onSnapshot(q, (snap) => {
        setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    } else {
      setResults([]);
    }
  }, [searchFromUrl, searchTerm]);

  return (
    <div className="explore-page">
      <Navbar />
      <div className="explore-content" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
        <div className="search-header-sticky">
          <input 
            className="explore-twitter-input" 
            placeholder="Buscar en Adaptive" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/explore?search=${searchTerm.toLowerCase()}`)}
          />
        </div>

        {(!searchFromUrl && !searchTerm) ? (
          <div className="trends-container">
            <h2 style={{ padding: '15px', fontWeight: '800' }}>Qué está pasando</h2>
            {trending.length > 0 ? trending.map((trend, index) => (
              <div 
                key={trend.id} 
                className="trend-row" 
                onClick={() => navigate(`/explore?search=${trend.name}`)}
                style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eff3f4' }}
              >
                <span style={{ fontSize: '13px', color: '#536471' }}>{index + 1} · Tendencia</span>
                <div style={{ fontWeight: '800', fontSize: '15px' }}>#{trend.name}</div>
                <span style={{ fontSize: '13px', color: '#536471' }}>{trend.count} {trend.count === 1 ? 'publicación' : 'publicaciones'}</span>
              </div>
            )) : (
              <p style={{ padding: '20px' }}>No hay tendencias aún. Publica algo con un hashtag.</p>
            )}
          </div>
        ) : (
          <div className="explore-results-feed">
            <div style={{ padding: '15px', borderBottom: '1px solid #eff3f4', display: 'flex', alignItems: 'center' }}>
              <button onClick={() => {setSearchTerm(""); navigate('/explore');}} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', marginRight: '20px' }}>←</button>
              <h2 style={{ fontSize: '19px', fontWeight: '800' }}>#{searchFromUrl || searchTerm}</h2>
            </div>
            {results.map(post => (
              <PostCard key={post.id} post={post} connection={connection} onLike={() => {}} onSave={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default Explorar;
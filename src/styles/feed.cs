/* =========================
   BASE
========================= */

.feed-wrapper {
  min-height: 100vh;
  background: #16181d;
  color: white;
  padding: 60px 20px;
  transition: 0.3s ease;
}

.feed-container {
  max-width: 720px;
  margin: 0 auto;
}

/* =========================
   INPUT
========================= */

.create-post {
  background: #1e2128;
  padding: 20px;
  border-radius: 18px;
  margin-bottom: 35px;
}

.create-post input {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
}

.create-post input:focus {
  outline: none;
}

/* =========================
   CARD
========================= */

.post-card {
  background: #1e2128;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  transition: 0.3s ease;
}

.post-card:hover {
  background: #23262f;
}

.post-card img {
  width: 100%;
  border-radius: 14px;
  margin-bottom: 20px;
}

.post-card h3 {
  font-weight: 500;
  margin-bottom: 12px;
}

.post-card p {
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  color: rgba(255,255,255,0.5);
}

/* =========================
   MEDIUM MODE
========================= */

.feed-wrapper.medium .post-card img {
  display: none;
}

/* =========================
   OFFLINE MODE
========================= */

.feed-wrapper.offline {
  background: #f4f4f4;
  color: #16181d;
}

.feed-wrapper.offline .post-card {
  background: white;
  color: #16181d;
}

.feed-wrapper.offline .post-card img {
  display: none;
}

.feed-wrapper.offline .create-post {
  background: white;
}

.offline-banner {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 30px;
}

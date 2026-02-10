const API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

export async function fetchTopNews() {
  const response = await fetch(
    `${BASE_URL}/top-headlines?language=en&pageSize=10&apiKey=${API_KEY}`
  );

  const data = await response.json();
  console.log("📰 Primer artículo completo:", data.articles[0]);

  return data.articles || [];
}
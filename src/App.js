import CreatePost from "./components/CreatePost";
import Feed from "./components/Feed";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Adaptive Social Network</h1>
      <CreatePost />
      <hr />
      <Feed />
    </div>
  );
}

export default App;

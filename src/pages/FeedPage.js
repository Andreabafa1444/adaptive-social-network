import Navbar from "../components/NavBar";
import CreatePost from "../components/CreatePost";
import Feed from "../components/Feed";

function FeedPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <CreatePost />
      <Feed />
    </div>
  );
}

export default FeedPage;

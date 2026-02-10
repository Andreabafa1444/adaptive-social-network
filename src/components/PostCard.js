import CommentSection from "./CommentSection";

function PostCard({ post, onLike, onSave }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "6px"
      }}
    >
      <strong>{post.authorUsername}</strong>

      {post.title && <h3>{post.title}</h3>}
      <p>{post.text}</p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: "100%", borderRadius: "4px" }}
        />
      )}

      <div>
        {post.tags?.map(tag => (
          <span key={tag} style={{ marginRight: "0.5rem" }}>
            #{tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => onLike(post)}>
          ❤️ {post.likes?.length || 0}
        </button>

        <button
          onClick={() => onSave(post)}
          style={{ marginLeft: "1rem" }}
        >
          🔖 Guardar
        </button>
      </div>

      {/* 👇 AQUÍ VAN LOS COMENTARIOS */}
      <CommentSection postId={post.id} />
    </div>
  );
}

export default PostCard;

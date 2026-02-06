function PostCard({ post, onLike, onSave, currentUser }) {
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
          {post.tags.map(tag => (
            <span key={tag} style={{ marginRight: "0.5rem" }}>
              #{tag}
            </span>
          ))}
        </div>
  
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => onLike(post)}>
            ❤️ {post.likes.length}
          </button>
  
          <button
            onClick={() => onSave(post)}
            style={{ marginLeft: "1rem" }}
          >
            🔖 Guardar
          </button>
        </div>
      </div>
    );
  }
  
  export default PostCard;
  
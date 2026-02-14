import { useState } from "react";
import CommentSection from "./CommentSection";
import "../styles/post.css";

function PostCard({ post, onLike, onSave, connection }) {

  const [showComments, setShowComments] = useState(false);

  if (!post) return null;

  return (
    <div className="post-card">

      {/* HEADER */}
      <div className="post-header">
        <div className="post-username">
          {post.authorUsername}
        </div>
      </div>

      {/* TITLE */}
      {post.title && (
        <h3 className="post-title">{post.title}</h3>
      )}

      {/* TEXT */}
      <p className="post-text">{post.text}</p>

      {/* IMAGE */}
      {post.imageUrl && connection?.online && connection.type !== "2g" && (
        <img
          src={post.imageUrl}
          alt=""
          className="post-image"
        />
      )}

      {/* FOOTER ACTIONS */}
      <div className="post-actions">

        <button
          className="post-action-btn"
          onClick={() => onLike(post)}
        >
          ❤️ {post.likes?.length || 0}
        </button>

        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬
        </button>

        <button
          className="post-action-btn"
          onClick={() => onSave(post)}
        >
          🔖
        </button>

      </div>

      {/* COMMENTS DROPDOWN */}
      {showComments && (
        <div className="post-comments">
          <CommentSection postId={post.id} />
        </div>
      )}

    </div>
  );
}

export default PostCard;

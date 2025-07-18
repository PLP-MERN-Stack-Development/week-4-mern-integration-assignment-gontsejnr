import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import "./PostCard.css";

const PostCard = ({ post }) => {
  const { isAuthenticated } = useAuth();
  const { toggleLike } = usePost();

  const handleLike = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      toggleLike(post._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <article className="post-card">
      <Link to={`/post/${post._id}`} className="post-card-link">
        {post.featuredImage && (
          <div className="post-card-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}

        <div className="post-card-content">
          <div className="post-card-header">
            <span
              className="post-category"
              style={{ backgroundColor: post.category?.color }}
            >
              {post.category?.name}
            </span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>

          <h3 className="post-title">{post.title}</h3>

          <p className="post-excerpt">
            {post.excerpt || truncateContent(post.content)}
          </p>

          <div className="post-card-footer">
            <div className="post-author">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.username} />
              ) : (
                <div className="author-avatar-placeholder">
                  {post.author?.firstName?.charAt(0)}
                  {post.author?.lastName?.charAt(0)}
                </div>
              )}
              <span>
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>

            <div className="post-stats">
              <button
                className={`like-button ${post.isLiked ? "liked" : ""}`}
                onClick={handleLike}
                disabled={!isAuthenticated}
              >
                ❤️ {post.likes?.length || 0}
              </button>
              <span className="view-count">👁️ {post.views}</span>
              <span className="comment-count">
                💬 {post.comments?.length || 0}
              </span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default PostCard;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePost } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "../comments/CommentSection";
import LoadingSpinner from "../common/LoadingSpinner";
import "./PostDetail.css";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    currentPost: post,
    loading,
    error,
    fetchPost,
    deletePost,
    toggleLike,
  } = usePost();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPost(id);
  }, [id, fetchPost]);

  const handleDelete = async () => {
    const result = await deletePost(id);
    if (result.success) {
      navigate("/");
    }
  };

  const handleLike = () => {
    if (isAuthenticated) {
      toggleLike(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading post</h2>
        <p>{error}</p>
        <button onClick={() => fetchPost(id)} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <h2>Post not found</h2>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.author._id === user._id;

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        <header className="post-header">
          <div className="post-meta">
            <span
              className="post-category"
              style={{ backgroundColor: post.category?.color }}
            >
              {post.category?.name}
            </span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-author-info">
            <div className="author-avatar">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.username} />
              ) : (
                <div className="author-avatar-placeholder">
                  {post.author?.firstName?.charAt(0)}
                  {post.author?.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="author-details">
              <h3>
                {post.author?.firstName} {post.author?.lastName}
              </h3>
              <p>@{post.author?.username}</p>
              {post.author?.bio && (
                <p className="author-bio">{post.author.bio}</p>
              )}
            </div>
          </div>

          {isAuthor && (
            <div className="post-actions">
              <Link to={`/edit-post/${post._id}`} className="btn btn-secondary">
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          )}
        </header>

        {post.featuredImage && (
          <div className="post-featured-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}

        <div className="post-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <h4>Tags:</h4>
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-stats">
          <button
            className={`like-button ${post.isLiked ? "liked" : ""}`}
            onClick={handleLike}
            disabled={!isAuthenticated}
          >
            ❤️ {post.likes?.length || 0}{" "}
            {post.likes?.length === 1 ? "Like" : "Likes"}
          </button>
          <span className="view-count">👁️ {post.views} Views</span>
        </div>
      </article>

      <CommentSection postId={post._id} />

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Post</h3>
            <p>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

import React, { useEffect, useState } from "react";
import { usePost } from "../../context/PostContext";
import PostCard from "./PostCard";
import Pagination from "../common/Pagination";
import CategoryFilter from "./CategoryFilter";
import LoadingSpinner from "../common/LoadingSpinner";
import "./PostList.css";

const PostList = () => {
  const {
    posts,
    pagination,
    categories,
    loading,
    error,
    fetchPosts,
    fetchCategories,
  } = usePost();

  const [filters, setFilters] = useState({
    page: 1,
    category: "",
    status: "published",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts(filters);
  }, [filters, fetchPosts]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
  };

  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading posts</h2>
        <p>{error}</p>
        <button onClick={() => fetchPosts(filters)} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="post-list-container">
      <div className="post-list-header">
        <h2>Latest Posts</h2>
        <CategoryFilter
          categories={categories}
          selectedCategory={filters.category}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>Be the first to create a post!</p>
        </div>
      ) : (
        <>
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PostList;

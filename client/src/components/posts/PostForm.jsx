import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../../context/PostContext";
import LoadingSpinner from "../common/LoadingSpinner";
import "./PostForm.css";

const PostForm = ({ initialPost = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { createPost, updatePost, fetchCategories, loading } = usePost();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "draft",
    featuredImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (initialPost) {
      setFormData({
        title: initialPost.title || "",
        content: initialPost.content || "",
        excerpt: initialPost.excerpt || "",
        category: initialPost.category?._id || "",
        tags: initialPost.tags ? initialPost.tags.join(", ") : "",
        status: initialPost.status || "draft",
        featuredImage: null,
      });

      if (initialPost.featuredImage) {
        setImagePreview(initialPost.featuredImage);
      }
    }
  }, [initialPost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.excerpt && formData.excerpt.length > 200) {
      newErrors.excerpt = "Excerpt must be less than 200 characters";
    }
    if (formData.tags && formData.tags.length > 100) {
      newErrors.tags = "Tags must be less than 100 characters";
    }
    if (
      formData.featuredImage &&
      formData.featuredImage.size > 5 * 1024 * 1024
    ) {
      newErrors.featuredImage = "Image size must be less than 5MB";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Prepare tags array
    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const postData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      if (isEdit && initialPost) {
        await updatePost(initialPost._id, postData);
      } else {
        await createPost(postData);
      }
      navigate("/posts");
    } catch {
      // Handle error (optional)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {/* Form fields go here */}
      {/* Example: */}
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Title"
      />
      {errors.title && <span className="error">{errors.title}</span>}
      {/* Add other fields similarly */}
      <input
        type="file"
        name="featuredImage"
        accept="image/*"
        onChange={handleImageChange}
      />
      {errors.featuredImage && (
        <span className="error">{errors.featuredImage}</span>
      )}
      <button type="submit" disabled={isSubmitting || loading}>
        {isEdit ? "Update Post" : "Create Post"}
      </button>
      {loading && <LoadingSpinner />}
    </form>
  );
};

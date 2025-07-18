import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

export const postAPI = {
  getPosts: (params) => api.get("/posts", { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updatePost: (id, postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  getCategories: () => api.get("/categories"),
};

export const commentAPI = {
  getComments: (postId) => api.get(`/comments/post/${postId}`),
  createComment: (commentData) => api.post("/comments", commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
};

export default api;

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { postAPI } from "../services/api";

const PostContext = createContext();

const postReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_POSTS":
      return { ...state, posts: action.payload, loading: false };
    case "SET_POST":
      return { ...state, currentPost: action.payload, loading: false };
    case "ADD_POST":
      return { ...state, posts: [action.payload, ...state.posts] };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        currentPost:
          state.currentPost?._id === action.payload._id
            ? action.payload
            : state.currentPost,
      };
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== action.payload),
      };
    case "SET_PAGINATION":
      return { ...state, pagination: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "TOGGLE_LIKE":
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload.postId
            ? {
                ...post,
                likes: action.payload.likes,
                isLiked: action.payload.isLiked,
              }
            : post
        ),
        currentPost:
          state.currentPost?._id === action.payload.postId
            ? {
                ...state.currentPost,
                likes: action.payload.likes,
                isLiked: action.payload.isLiked,
              }
            : state.currentPost,
      };
    default:
      return state;
  }
};

export const PostProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, {
    posts: [],
    currentPost: null,
    categories: [],
    pagination: null,
    loading: false,
    error: null,
  });

  const fetchPosts = useCallback(async (params = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await postAPI.getPosts(params);
      dispatch({ type: "SET_POSTS", payload: response.data.posts });
      dispatch({ type: "SET_PAGINATION", payload: response.data.pagination });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to fetch posts",
      });
    }
  }, []);

  const fetchPost = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await postAPI.getPost(id);
      dispatch({ type: "SET_POST", payload: response.data });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to fetch post",
      });
    }
  }, []);

  const createPost = async (postData) => {
    try {
      const response = await postAPI.createPost(postData);
      dispatch({ type: "ADD_POST", payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create post",
      };
    }
  };

  const updatePost = async (id, postData) => {
    try {
      const response = await postAPI.updatePost(id, postData);
      dispatch({ type: "UPDATE_POST", payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update post",
      };
    }
  };

  const deletePost = async (id) => {
    try {
      await postAPI.deletePost(id);
      dispatch({ type: "DELETE_POST", payload: id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete post",
      };
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await postAPI.toggleLike(postId);
      dispatch({
        type: "TOGGLE_LIKE",
        payload: {
          postId,
          likes: response.data.likes,
          isLiked: response.data.isLiked,
        },
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await postAPI.getCategories();
      dispatch({ type: "SET_CATEGORIES", payload: response.data });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <PostContext.Provider
      value={{
        ...state,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
        toggleLike,
        fetchCategories,
        clearError,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};

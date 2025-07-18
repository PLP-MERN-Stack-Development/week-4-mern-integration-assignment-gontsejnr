import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI.setAuthToken(token);
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile();
      dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
    } catch (error) {
      localStorage.removeItem("token");
      authAPI.setAuthToken(null);
    }
  };

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      authAPI.setAuthToken(token);

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      return { success: true };
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.message || "Login failed",
      });
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      authAPI.setAuthToken(token);

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      return { success: true };
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.message || "Registration failed",
      });
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    authAPI.setAuthToken(null);
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

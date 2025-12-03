import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        await loadUser();
      } else {
        setLoading(false);
      }
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to load user:", error);
      // Token invalid, clear auth
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { user, access_token, refresh_token } = response.data;

    setUser(user);
    setAccessToken(access_token);
    setRefreshToken(refresh_token);

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return response.data;
  };

  const register = async (email, password, name) => {
    const response = await api.post("/api/auth/register", {
      email,
      password,
      name,
    });
    const { user, access_token, refresh_token } = response.data;

    setUser(user);
    setAccessToken(access_token);
    setRefreshToken(refresh_token);

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return response.data;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const value = {
    user,
    loading,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerResident } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem("haven_token");
      const storedUser = localStorage.getItem("haven_user");
      if (storedToken && storedUser) {
        return {
          token: storedToken,
          ...JSON.parse(storedUser)
        };
      }
    } catch {
      localStorage.removeItem("haven_token");
      localStorage.removeItem("haven_user");
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const getDashboardPath = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "/admin";
      case "RESIDENT":
        return "/resident";
      case "STAFF":
        return "/staff";
      default:
        return "/login";
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      if (!data.token) {
        throw new Error("No authentication token received from server.");
      }

      const userData = {
        username: data.username,
        email: data.email,
        role: data.role
      };

      localStorage.setItem("haven_token", data.token);
      localStorage.setItem("haven_user", JSON.stringify(userData));

      setUser({
        token: data.token,
        ...userData
      });

      return {
        success: true,
        role: data.role,
        redirectPath: getDashboardPath(data.role),
        message: data.message
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await registerResident(formData);
      if (!data.token) {
        throw new Error("No token received after registration.");
      }

      const userData = {
        username: data.username,
        email: data.email,
        role: data.role
      };

      localStorage.setItem("haven_token", data.token);
      localStorage.setItem("haven_user", JSON.stringify(userData));

      setUser({
        token: data.token,
        ...userData
      });

      return {
        success: true,
        role: data.role,
        redirectPath: getDashboardPath(data.role),
        message: data.message
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("haven_token");
    localStorage.removeItem("haven_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user?.token,
        role: user?.role,
        login,
        register,
        logout,
        getDashboardPath
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

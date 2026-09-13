import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("blog_user");
    return stored ? JSON.parse(stored) : null;
  });

  function persist(data) {
    localStorage.setItem("blog_token", data.token);
    localStorage.setItem("blog_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    persist(data);
  }

  async function signup(name, email, password) {
    const data = await api.post("/auth/signup", { name, email, password });
    persist(data);
  }

  async function loginWithGoogle(credential) {
    const data = await api.post("/auth/google", { credential });
    persist(data);
  }

  function logout() {
    localStorage.removeItem("blog_token");
    localStorage.removeItem("blog_user");
    setUser(null);
  }

  const value = {
    user,
    isAuthor: user?.role === "author",
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("threatlens_token")
  );

  const [user, setUser] = useState(null);

  const login = async (identifier, password) => {
    const response = await api.post("/auth/login", {
      identifier,
      password,
    });

    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem("threatlens_token", newToken);

    setToken(newToken);
    setUser(loggedInUser);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("threatlens_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
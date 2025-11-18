import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Very similar intent to the web AuthContext, but adapted for mobile.
// We keep track of the authenticated role and basic user info locally.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // "Farmer" | "Buyer" | "Supplier"
  const [user, setUser] = useState(null); // { name, img }

  const login = async ({ role: newRole, user: userData }) => {
    setIsAuthenticated(true);
    setRole(newRole);
    setUser(userData || null);
    try {
      await AsyncStorage.setItem(
        "farmconnect-auth",
        JSON.stringify({ isAuthenticated: true, role: newRole, user: userData })
      );
    } catch {
      // ignore persistence errors
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem("farmconnect-auth");
    } catch {
      // ignore
    }
  };

  const value = {
    isAuthenticated,
    role,
    user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);



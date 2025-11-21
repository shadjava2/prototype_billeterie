"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types";
import { UserBilleterie, RoleBilleterie } from "@/data/types";
import { getDefaultUserForRole } from "./auth-billeterie";

interface AuthContextType {
  user: User | null;
  userBilleterie: UserBilleterie | null;
  login: (email: string, password: string) => boolean;
  loginBilleterie: (role: RoleBilleterie, operateurId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userBilleterie, setUserBilleterie] = useState<UserBilleterie | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (session stockée)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }

    // Vérifier si l'utilisateur billeterie est déjà connecté
    const storedUserBilleterie = localStorage.getItem("userBilleterie");
    if (storedUserBilleterie) {
      try {
        setUserBilleterie(JSON.parse(storedUserBilleterie));
      } catch (e) {
        localStorage.removeItem("userBilleterie");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Pour le prototype, on accepte n'importe quel mot de passe
    const { authenticate } = require("./auth");
    const authenticatedUser = authenticate(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      return true;
    }
    return false;
  };

  const loginBilleterie = (role: RoleBilleterie, operateurId?: string) => {
    const userB = getDefaultUserForRole(role, operateurId);
    if (userB) {
      setUserBilleterie(userB);
      localStorage.setItem("userBilleterie", JSON.stringify(userB));
    }
  };

  const logout = () => {
    setUser(null);
    setUserBilleterie(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userBilleterie");
  };

  return (
    <AuthContext.Provider value={{
      user,
      userBilleterie,
      login,
      loginBilleterie,
      logout,
      isAuthenticated: !!user || !!userBilleterie
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// Utilitário que você já criou
const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000;
  } catch (error) {
    return false;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);

  // Recupera a sessão ao abrir o app em QUALQUER tela
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    
    if (savedToken && savedUser && isTokenValid(savedToken)) {
      setIsAuthenticated(true);
      setToken(savedToken);
      setUserRole(savedUser.role);
      setUserName(savedUser.userName);
      setUserPhoto(savedUser.fotoPerfil);
    } else {
      handleLogout(); // Limpa sujeira se expirou
    }
  }, []);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data.token);
    setUserRole(data.user.role);
    setUserName(data.user.userName);
    setUserPhoto(data.user.fotoPerfil);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserRole(null);
    setUserName(null);
    setUserPhoto(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleUpdateUserPhoto = (newPhotoUrl) => setUserPhoto(newPhotoUrl);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, token, userRole, userName, userPhoto,
      handleLogin, handleLogout, handleUpdateUserPhoto
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para "abrir a torneira"
export const useAuth = () => useContext(AuthContext);
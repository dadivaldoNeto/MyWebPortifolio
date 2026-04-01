// src/components/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // 👈 useNavigate importado!
import { useAuth } from "../contexts/AuthContext";
import Header from "./compartilhado/header/Header";
import Footer from "./Footer";
import AuthModal from "./auth/AuthModal";
import Modal from "./Modal";
import "../styles/mainlayout.css";

const MainLayout = () => {
  const { 
    isAuthenticated, userName, userPhoto, userRole, token, 
    handleLogin, handleLogout 
  } = useAuth(); // "Abrindo a torneira"

  const navigate = useNavigate(); // 👈 GPS ativado
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Funções que o Header precisa
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  
  // 👉 NOVO: Função que manda o usuário para a tela de editar perfil
  const openEditProfile = () => {
    navigate("/editar-perfil");
    window.scrollTo({ top: 0, behavior: "smooth" }); // Rola pro topo por elegância
  };

  const handleLoginSuccess = (data) => {
    handleLogin(data);
    closeAuthModal();
  };

  const handleAdminNavigation = async (e) => {
    e.preventDefault();
    if (!token) return alert("Você precisa estar logado!");
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/auth/validar-admin", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) navigate('/admin');
      else alert("Acesso negado.");
    } catch (error) {
      alert("Servidor indisponível no momento.");
    }
  };

  return (
    <div className="layout-wrapper">
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userPhoto={userPhoto}
        userRole={userRole}
        handleLogin={handleLoginSuccess}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        handleAdminNavigation={handleAdminNavigation}
        openEditProfile={openEditProfile} // 👈 PASSANDO A FUNÇÃO PRO HEADER AQUI!
      />

      {/* Se o modal for aberto, ele aparece por cima de qualquer tela */}
      <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
        <AuthModal handleLoginSuccess={handleLoginSuccess} onClose={closeAuthModal} />
      </Modal>

      <main className="layout-main-content">
        <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
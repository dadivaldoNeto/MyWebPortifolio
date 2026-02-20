import React, { useState, useEffect } from "react";
import "../styles/header.css";

// NOVO: Adicionei a prop 'goHome' aqui
const Header = ({ isAuthenticated, userName, handleLogout, openAuthModal, openEditProfile, goHome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Detecta rolagem da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IMAGEM FAKE PADRÃO (Silhueta)
  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">

        {/* BOTÃO MENU (ESQUERDA NO MOBILE) */}
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        {/* NAVEGAÇÃO */}
        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-header">
            <span className="nav-title">Bruno Dev</span>
            <span className="nav-subtitle">Full Stack Developer</span>
            <div className="nav-divider" />
          </div>

          <div className="nav-links">
            {/* NOVO: O botão Home agora chama a prop goHome além de fechar o menu mobile */}
            <button 
              className="nav-link btn-home" 
              onClick={() => {
                if (goHome) goHome(); // Volta pro início
                setIsMenuOpen(false); // Fecha o menu no celular
              }}
            >
              Home
            </button>
            <a href="#about" className="nav-link">Sobre</a>
            <a href="#skills" className="nav-link">Habilidades</a>
            <a href="#projects" className="nav-link">Projetos</a>
            <a href="#contact" className="nav-link">Contato</a>
            <a href="#feedback" className="nav-link">Deixe seu Feedback</a>
          </div>

          <div className="nav-footer">
            {isAuthenticated && userName ? (
              <span className="welcome-text">
                Bem-vindo, <strong>{userName}</strong>!
              </span>
            ) : (
              <button
                className="nav-auth-button"
                onClick={() => {
                  openAuthModal();
                  setIsMenuOpen(false);
                }}
              >
                Entrar
              </button>
            )}

            {isAuthenticated && (
              <button
                className="nav-auth-button"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Sair
              </button>
            )}

            <span className="nav-footer-text">© 2026 BrunoFraga.dev</span>
          </div>
        </nav>

        {/* DIREITA (COM O NOVO DROPDOWN E AVATAR) */}
        <div className="right-section">
          {isAuthenticated && userName ? (
            <div className="user-menu-container">
              <button
                className="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <img src={defaultAvatar} alt="Perfil" className="header-avatar" />
                <span>Olá, <strong>{userName}</strong> ▼</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      openEditProfile();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Editar Perfil
                  </button>
                  <button 
                    className="dropdown-item logout" 
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Sair / Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-button" onClick={openAuthModal}>
              Entrar
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
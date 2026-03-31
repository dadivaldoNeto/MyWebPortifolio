import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 NOVO: Importamos o useLocation
import "../styles/header.css";

const Header = ({
  isAuthenticated,
  userName,
  userPhoto,
  handleLogout,
  openAuthModal,
  openEditProfile,
  userRole
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // 👈 O nosso GPS atual

  // Verifica se o usuário está exatamente na raiz do site ("/")
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const avatarImage = userPhoto || defaultAvatar;
  const isAdminMaster = isAuthenticated && userRole === "ADMIN3";

  const handleAdminNavigation = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    navigate('/admin');
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-header">
            <span className="nav-title">Bruno Dev</span>
            <span className="nav-subtitle">Full Stack Developer</span>
            <div className="nav-divider" />
          </div>

          <div className="nav-links">
            <button
              className="nav-link" // 👈 Limpamos o btn-home daqui
              style={{ background: 'transparent', border: 'none', padding: '10px', fontFamily: 'inherit' }} // 👈 Reset do navegador
              onClick={() => { navigate("/"); setIsMenuOpen(false); }}
            >
              Home
            </button>

            <button
              className="nav-link" // 👈 Limpamos o btn-articles daqui
              style={{ background: 'transparent', border: 'none', padding: '10px', fontFamily: 'inherit' }} // 👈 Reset do navegador
              onClick={() => { navigate("/artigos"); setIsMenuOpen(false); }}
            >
              Artigos
            </button>

            {isHomePage && (
              <>
                <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sobre</a>
                <a href="#skills" className="nav-link" onClick={() => setIsMenuOpen(false)}>Habilidades</a>
                <a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>Projetos</a>
                <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contato</a>
              </>
            )}
          </div>

          <div className="nav-footer">
            {isAuthenticated && userName ? (
              <>
                <div className="mobile-user-profile">
                  <img src={avatarImage} alt="Perfil" className="header-avatar" />
                  <span>Olá, <strong>{userName}</strong></span>
                </div>

                <button className="nav-auth-button" onClick={() => { openEditProfile(); setIsMenuOpen(false); }}>
                  Editar Perfil
                </button>
                <button className="nav-auth-button logout" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                  Sair
                </button>
              </>
            ) : (
              <button className="nav-auth-button" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
                Acessar / Cadastrar
              </button>
            )}
            <span className="nav-footer-text">© 2026 BrunoFraga.dev</span>
          </div>
        </nav>

        {/* SEÇÃO DIREITA (Avatar e Login) */}
        <div className={`right-section ${isMenuOpen ? "hide-on-mobile" : ""}`}>
          {isAdminMaster && (
            <button
              className="nav-link admin-nav-btn"
              onClick={handleAdminNavigation}
            >
              Painel Admin
            </button>
          )}
          {isAuthenticated && userName ? (
            <div className="user-menu-container">
              <button className="user-menu-button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <img src={avatarImage} alt="Perfil" className="header-avatar" />
                <span className="user-menu-name">Olá, <strong>{userName}</strong> ▼</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item" onClick={() => { openEditProfile(); setIsUserMenuOpen(false); }}>
                    Editar Perfil
                  </button>
                  <button className="dropdown-item logout" onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}>
                    Sair / Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-button" onClick={openAuthModal}>Acessar / Cadastrar</button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
       
        {/* Botão hamburguer */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Menu de navegação */}
        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          {/* Botão de fechar dentro do menu */}
          {isMenuOpen && (
            <button className="close-menu" onClick={closeMenu} aria-label="Fechar menu">
              ✕
            </button>
          )}

          <a href="#about" className="nav-link" onClick={closeMenu}>
            Sobre
          </a>
          <a href="#experience" className="nav-link" onClick={closeMenu}>
            Experiência
          </a>
          <a href="#skills" className="nav-link" onClick={closeMenu}>
            Skills
          </a>
          <a href="#projects" className="nav-link" onClick={closeMenu}>
            Projetos
          </a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

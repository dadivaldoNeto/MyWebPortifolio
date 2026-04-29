import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/articlecarousel.css";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";
const SLIDE_DURATION = 6000;
const TICK_MS = 50;
const MAX_ARTICLES = 6;

const ArticleCarousel = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isHoveredRef = useRef(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/geral/artigos/listar-ultimos-publicados`);
      if (res.ok) {
        const payload = await res.json();
        const lista = payload.dados || payload.data || payload;
        if (Array.isArray(lista) && lista.length > 0) {
          const sorted = lista
            .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
            .slice(0, MAX_ARTICLES);
          setArticles(sorted);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (articles.length <= 1) return;

    intervalRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        setElapsed((prev) => prev + TICK_MS);
      }
    }, TICK_MS);

    return () => clearInterval(intervalRef.current);
  }, [articles.length]);

  useEffect(() => {
    if (elapsed >= SLIDE_DURATION) {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
      setElapsed(0);
    }
  }, [elapsed, articles.length]);

  const goTo = (idx) => {
    if (idx === currentIndex) return;
    setElapsed(0);
    setCurrentIndex(idx);
  };

  const goPrev = () => goTo((currentIndex - 1 + articles.length) % articles.length);
  const goNext = () => goTo((currentIndex + 1) % articles.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsHovered(true);
  };

  const handleTouchEnd = (e) => {
    setIsHovered(false);
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

  const formatarData = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (articles.length === 0) return null;

  return (
    <div className="kc-wrapper">
      <div className="kc-header">Últimos artigos publicados</div>
      <div
        className="kc-viewport"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="kc-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {articles.map((art) => (
            <div key={art.id} className="kc-slide">
              <div className="kc-bg">
                <img
                  src={art.coverImage || "https://picsum.photos/800/400"}
                  alt={art.title}
                  className="kc-bg-img"
                />
                <div className="kc-overlay" />
              </div>

              <div className="kc-content">
                <div className="kc-tags">
                  {art.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="kc-tag">{tag}</span>
                  ))}
                </div>

                <h3 className="kc-title">{art.title}</h3>
                <p className="kc-subtitle">
                  {art.subtitle?.length > 130
                    ? art.subtitle.slice(0, 130) + "…"
                    : art.subtitle}
                </p>

                <div className="kc-meta">
                  <span className="kc-date">{formatarData(art.dataCriacao)}</span>
                  <span className="kc-author">✍ {art.criadoPor}</span>
                </div>

                <button className="kc-btn" onClick={() => navigate(`/artigo/${art.slug}`)}>
                  Ler artigo completo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {articles.length > 1 && (
          <>
            <button className="kc-arrow kc-arrow--left" onClick={goPrev}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="kc-arrow kc-arrow--right" onClick={goNext}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <div className="kc-bars">
          {articles.map((_, idx) => (
            <button key={idx} className="kc-bar-btn" onClick={() => goTo(idx)}>
              <div className="kc-bar-track">
                <div
                  className="kc-bar-fill"
                  style={{
                    width:
                      idx < currentIndex ? "100%" :
                      idx === currentIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="kc-counter">
          {currentIndex + 1} / {articles.length}
        </div>
      </div>
    </div>
  );
};

export default ArticleCarousel;
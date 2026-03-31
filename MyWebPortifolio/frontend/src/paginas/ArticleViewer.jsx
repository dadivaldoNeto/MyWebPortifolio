// src/paginas/ArticleViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArticleFeedbackPanel from "../components/ArticleFeedbackPanel";
import "../styles/articleviewer.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ── Estimativa de tempo de leitura ── */
const estimateReadTime = (html = "") => {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

/* ── Barra de progresso de scroll ── */
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el    = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="reading-progress-track">
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const ArticleViewer = () => {
  const { slug }            = useParams();
  const navigate            = useNavigate();
  const [article, setArticle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [readTime, setReadTime] = useState(0);

  useEffect(() => {
    const fetchArticleBySlug = async () => {
      try {
        const response = await fetch(`${BASE_URL}/geral/artigos/${slug}`);
        if (response.ok) {
          const data = await response.json();
          const art  = data.dados || data;
          setArticle(art);
          setReadTime(estimateReadTime(art.contentHtml));
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao carregar artigo:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchArticleBySlug();
  }, [slug, navigate]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="article-loading-screen">
        <div className="av-loading-orb" />
        <p>Carregando artigo…</p>
      </div>
    );
  }

  if (!article) return null;

  const authorInitial = article.criadoPor
    ? article.criadoPor.charAt(0).toUpperCase()
    : "B";

  const formattedDate = new Date(article.dataCriacao).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Barra de progresso de leitura — fora do article para ficar no topo da página */}
      <ReadingProgressBar />

      <article className="article-viewer-container av-fadein">

        {/* ══ 1. CABEÇALHO ══ */}
        <header className="article-header">

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="article-tags">
              {article.tags.map(t => (
                <span key={t} className="tag-pill">#{t}</span>
              ))}
            </div>
          )}

          {/* Título */}
          <h1 className="article-title">{article.title}</h1>

          {/* Subtítulo */}
          {article.subtitle && (
            <p className="article-subtitle">{article.subtitle}</p>
          )}

          {/* Meta: autor + data + tempo de leitura */}
          <div className="article-meta">
            <div className="meta-author">
              <div className="author-avatar">{authorInitial}</div>
              <div className="author-details">
                <span className="author-name">{article.criadoPor || "Autor Desconhecido"}</span>
                <span className="publish-date">
                  {formattedDate}
                  <span className="meta-dot">·</span>
                  <span className="read-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }}>
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {readTime} min de leitura
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ══ 2. CAPA (HERO IMAGE) ══ */}
        {article.coverImage && (
          <figure className="article-cover-wrapper">
            <img
              src={article.coverImage}
              alt={article.title}
              className="article-cover-image"
              loading="lazy"
            />
          </figure>
        )}

       {/* ══ 3. CORPO EDITORIAL ══ */}
        <section
          className="editorial-content"
          style={{ fontFamily: article.fontFamily || "inherit" }}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* ══ 4. DIVIDER + TAGS RODAPÉ ══ */}
        <div className="article-footer-tags">
          {article.tags?.map(t => (
            <span key={t} className="tag-pill tag-pill--footer">#{t}</span>
          ))}
        </div>

        {/* 🚀 AQUI ENTRA A MÁGICA: O Card de Feedback Inline! */}
        {article.id && (
          <div className="article-inline-feedback">
            <ArticleFeedbackPanel articleId={article.id} />
          </div>
        )}

        {/* ══ 5. RODAPÉ ══ */}
        <footer className="article-footer">
          <button className="btn-back-home" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar para os artigos
          </button>
        </footer>

      </article>
    </>
  );
};

export default ArticleViewer;

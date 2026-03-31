import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/articleviewer.css"; 

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ArticleViewer = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleBySlug = async () => {
      try {
        const response = await fetch(`${BASE_URL}/geral/artigos/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data.dados || data);
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

  if (loading) {
    return (
      <div className="article-loading-screen">
        <div className="spinner"></div>
        <p>Carregando conhecimento...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    // Usamos a tag semântica <article> que é o correto para SEO
    <article className="article-viewer-container animate-fadeIn">
      
      {/* 1. CABEÇALHO DO ARTIGO */}
      <header className="article-header">
        <div className="article-tags">
          {article.tags?.map(t => <span key={t} className="tag-pill">#{t}</span>)}
        </div>
        
        <h1 className="article-title">{article.title}</h1>
        {article.subtitle && <h2 className="article-subtitle">{article.subtitle}</h2>}
        
        <div className="article-meta">
          <div className="meta-author">
            {/* Um avatar genérico bonitinho pro autor, se não tiver foto */}
            <div className="author-avatar">
              {article.criadoPor ? article.criadoPor.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <span className="author-name">{article.criadoPor || "Autor Desconhecido"}</span>
              <span className="publish-date">
                {new Date(article.dataCriacao).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. A CAPA (HERO IMAGE) DOMADA */}
      {article.coverImage && (
        <div className="article-cover-wrapper">
          <img src={article.coverImage} alt={article.title} className="article-cover-image" />
        </div>
      )}

      {/* 3. O CORPO DO TEXTO (TIPTAP) */}
      <section 
        className="editorial-content" 
        style={{ fontFamily: article.fontFamily || 'inherit' }}
        dangerouslySetInnerHTML={{ __html: article.contentHtml }} 
      />
      
      {/* 4. RODAPÉ DO ARTIGO (Call to Action de Voltar) */}
      <footer className="article-footer">
        <button className="btn-back-home" onClick={() => navigate("/")}>
          ← Voltar para os artigos
        </button>
      </footer>

    </article>
  );
};

export default ArticleViewer;
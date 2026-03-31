import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/articleshowcase.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ArticleShowcase = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("newest"); 

  const navigate = useNavigate();

  // 1. Busca inicial (Catraca Liberada)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/geral/artigos/listar-todos`);
        if (response.ok) {
          const data = await response.json();
          // Recebe TUDO o que o endpoint mandar, sem filtrar status
          const list = data.dados || data;
          setArticles(list);
          setFilteredArticles(list);
        }
      } catch (error) {
        console.error("Erro ao buscar artigos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // 2. O Motor de Busca e Filtro (Título e Tags)
  useEffect(() => {
    let result = articles;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(a => 
        (a.title && a.title.toLowerCase().includes(lowerSearch)) || 
        (a.subtitle && a.subtitle.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedTag !== "Todos") {
      result = result.filter(a => a.tags && a.tags.includes(selectedTag));
    }

    // Ordenação (Com proteção caso venha sem data)
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.dataCriacao || 0).getTime();
      const dateB = new Date(b.dataCriacao || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredArticles(result);
  }, [searchTerm, selectedTag, sortOrder, articles]);

  // Extrai tags únicas ignorando artigos que vierem sem tag
  const allTags = ["Todos", ...new Set(articles.flatMap(a => a.tags || []))];

  if (loading) {
    return (
      <div className="showcase-loading">
        <div className="spinner"></div>
        <p>Carregando acervo...</p>
      </div>
    );
  }

  return (
    <div className="showcase-container animate-fadeIn">
      
      <header className="showcase-header">
        <h1 className="showcase-title">Explorar Artigos</h1>
        <p className="showcase-subtitle">Insights, tutoriais e reflexões sobre tecnologia e desenvolvimento.</p>
        
        <div className="showcase-toolbar glass-panel">
          
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por título ou assunto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="toolbar-controls">
            <select 
              className="sort-select" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
            </select>
          </div>
        </div>

        <div className="category-pills">
          {allTags.map(tag => (
            <button 
              key={tag} 
              className={`pill-btn ${selectedTag === tag ? "active" : ""}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag === "Todos" ? "🌍 Todos" : `#${tag}`}
            </button>
          ))}
        </div>
      </header>

      <section className="articles-grid">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <article 
              key={article.id || article.slug} 
              className="article-card glass-panel"
              onClick={() => navigate(`/artigo/${article.slug}`)}
            >
              <div className="card-image-wrapper">
                <img 
                  src={article.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80"} 
                  alt={article.title || "Artigo"} 
                  className="card-image"
                />
                <div className="card-tags-overlay">
                  {article.tags?.[0] && <span className="primary-tag">{article.tags[0]}</span>}
                </div>
              </div>
              
              <div className="card-content">
                <span className="card-date">
                  {article.dataCriacao ? new Date(article.dataCriacao).toLocaleDateString('pt-BR') : 'Data não informada'}
                </span>
                <h3 className="card-title">{article.title || "Sem Título"}</h3>
                <p className="card-excerpt">
                  {article.subtitle ? article.subtitle.substring(0, 80) + '...' : 'Sem descrição disponível.'}
                </p>
                
                <div className="card-footer">
                  <span className="card-author">{article.criadoPor || "Autor"}</span>
                  <span className="read-more">Ler artigo →</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h3>Nenhum artigo encontrado.</h3>
            <p>Tente mudar os filtros ou a sua pesquisa.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default ArticleShowcase;
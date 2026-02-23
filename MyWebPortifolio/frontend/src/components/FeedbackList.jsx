import React, { useState, useEffect, useCallback } from 'react';
import '../styles/feedbacklist.css';

// --- Utilitário de API ---
const API_BASE = `${import.meta.env.VITE_API_URL}/feedback`;

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && response.status <= 502 && attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Erro de conexão persistente.");
};

// --- Sub-componente: Item da Lista ---
const FeedbackItem = ({ feedback, colorClass, isAdmin, token, handleDelete }) => {
  const { id, comentario, notaAvaliacao, dataDeCriacao, criadoPor, fotoUsuario } = feedback;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data não disponível' : 
      date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderRating = (val) => {
    const stars = Math.max(1, Math.min(5, Number(val) || 1));
    return (
      <div className="feedback-item-rating">
        <span className="full-stars">{'★'.repeat(stars)}</span>
        <span className="empty-stars">{'☆'.repeat(5 - stars)}</span>
      </div>
    );
  };

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <div className="whatsapp-bubble-container">
      <div className={`whatsapp-bubble ${colorClass}`} role="article">
        <div className="feedback-header">
          <img src={fotoUsuario || defaultAvatar} alt={criadoPor} className="feedback-avatar" />
          <div className="feedback-user-info">
            <p className="feedback-item-username">{criadoPor || 'Usuário'}</p>
            {renderRating(notaAvaliacao)}
          </div>
        </div>
        <p className="feedback-item-comment">{comentario || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(dataDeCriacao)}</div>
        {isAdmin && (
          <button className="delete-button" onClick={() => handleDelete(id)}>delete</button>
        )}
      </div>
    </div>
  );
};

// --- Componente Principal ---
const FeedbackList = ({ userRole, token }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = userRole?.includes("ADMIN");

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(`${API_BASE}/listar-todos`, { method: 'GET' });
      if (!response.ok) throw new Error("Erro ao carregar feedbacks.");
      const data = await response.json();
      setFeedbacks(Array.isArray(data.dados) ? data.dados : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente apagar este feedback?")) return;
    try {
      const resp = await fetch(`${API_BASE}/deletefeedback/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resp.ok) fetchFeedbacks();
    } catch {
      alert("Erro ao deletar.");
    }
  };

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  return (
    <section className="feedback-list-container">
      <div className="feedback-list-header">
        <h2 className="feedback-list-title">Feedbacks Recebidos</h2>
        <button className="reload-button" onClick={fetchFeedbacks} disabled={isLoading}>
          {isLoading ? '...' : 'Recarregar'}
        </button>
      </div>

      {isLoading ? <p className="loading-text">Carregando...</p> : 
       error ? <p className="error-text">{error}</p> : 
       feedbacks.length === 0 ? <p className="no-feedback-text">Nenhum feedback encontrado.</p> : (
        <div className="feedback-list">
          {feedbacks.map((fb, i) => (
            <FeedbackItem key={fb.id || i} feedback={fb} isAdmin={isAdmin} token={token} 
              handleDelete={handleDelete} colorClass={i % 2 === 0 ? '' : 'whatsapp-bubble-alt'} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeedbackList;
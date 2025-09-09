import React, { useState } from "react";
import "../styles/feedback.css";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    if (e.target.value.length <= 1000) {
      setComment(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      setSubmitted(true);
      // Aqui você pode adicionar lógica para enviar o feedback para um backend, se necessário
    }
  };

  return (
    <section className="feedback">
      <h2>Deixe seu Feedback</h2>
      {submitted ? (
        <div className="feedback-submitted">
          <p>Obrigado pelo seu feedback!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="feedback-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? "filled" : ""}`}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="feedback-comment"
            placeholder="Escreva seu comentário (máximo 1000 caracteres)"
            value={comment}
            onChange={handleCommentChange}
            maxLength={1000}
          />
          <p className="char-count">{comment.length}/1000 caracteres</p>
          <button type="submit" className="feedback-submit" disabled={rating === 0 || !comment.trim()}>
            Enviar Feedback
          </button>
        </form>
      )}
    </section>
  );
};

export default Feedback;
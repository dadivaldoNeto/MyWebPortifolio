import React, { useState, useEffect } from "react";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // Dicionário para substituir palavras inadequadas
  const badWords = {
    merda: "brigadeiro", bosta: "docinho", cocô: "florzinha", porra: "pipoca",
    caralho: "sorvete", carai: "caramba", cacete: "biscoito", foda: "sensacional",
    pqp: "uau", pequepe: "peixinho", lixo: "tesouro", idiota: "sábio",
    burro: "gênio", imbecil: "inteligente", retardado: "esperto", mongol: "atleta",
    jumento: "mestre", asno: "líder", otário: "campeão", trouxa: "ingênuo",
    babaca: "herói", mané: "guerreiro", zé_ruela: "camarada", tonto: "desatento",
    cretino: "bobalhão", fanfarrão: "engraçadinho", palhaço: "artista", canalha: "travesso",
    safado: "malandro", puta: "estrela", putaria: "festa", vadia: "amiga",
    vagabundo: "trabalhador", desgraça: "alegria", nojento: "diferente", ridículo: "divertido",
    esquisito: "único", maldito: "levado", palhaçada: "brincadeira", bunda: "popozão",
    corno: "sortudo", chifrudo: "desprevenido", piolho: "pequenino", cabrão: "carinha",
    carneiro: "ovelhinha", nego: "luz", ladrão: "iluminado", burrice: "desafio",
    chato: "curioso", fracassado: "vencedor", droga: "puxa vida",
  };

  // Normaliza o texto para uma verificação mais eficaz
  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/(.)\1+/g, "$1");

  // Substitui as palavras inadequadas e exibe um aviso
  const replaceBadWords = (text) => {
    let filteredText = text;
    const foundBadWords = [];
    
    for (const badWord in badWords) {
      const regex = new RegExp(`\\b${badWord}\\b`, "gi");
      if (text.match(regex)) { // Verifica no texto original para evitar falsos positivos da normalização
          if (!foundBadWords.includes(badWord.toUpperCase())){
             foundBadWords.push(badWord.toUpperCase());
          }
          filteredText = filteredText.replace(regex, badWords[badWord]);
      }
    }

    if (foundBadWords.length > 0) {
      setWarning(
        `Ei! Palavras como "${foundBadWords.join(
          ", "
        )}" foram trocadas por algo mais amigável 😉`
      );
    }

    return filteredText;
  };

  // Temporizador para remover o aviso após 3 segundos
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  const handleRating = (value) => setRating(value);

  const handleCommentChange = (e) => {
    if (e.target.value.length <= 1000) {
      const newValue = replaceBadWords(e.target.value);
      setComment(newValue);
    }
  };
    
  // Envia o feedback para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      setIsLoading(true);
      setSubmissionError("");

      // Monta o objeto de dados conforme o DTO do backend
      const feedbackData = {
        userFeedback: comment,
        userRating: rating,
      };

      try {
        // ATENÇÃO: Substitua 'http://localhost:8080' pela URL real da sua API
        const response = await fetch('https://microservice-feedback.onrender.com/feedback/criar-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        if (response.ok) {
          // Se a requisição foi bem-sucedida (200 OK), exibe a mensagem de sucesso
          setSubmitted(true);
        } else {
          // Se o servidor retornou um erro, exibe a mensagem de servidor indisponível
          setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
        }
      } catch (error) {
        // Se houve um erro de rede, exibe a mesma mensagem de servidor indisponível
        console.error("Erro de conexão:", error);
        setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
      } finally {
        // Para de carregar, independentemente do resultado
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <style>{`
        .feedback-container {
            background-color: #121212;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            font-family: sans-serif;
        }

        .feedback {
          background-color: #181818;
          padding: 20px;
          border-radius: 10px;
          color: #fff;
          margin-top: 20px;
          transform: translateY(-3px);
          font-size: 18px;
          max-width: 42rem;
          width: 100%;
          border: 2px solid transparent; /* Adicionado para evitar pulo no hover */
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          transition: border-color 0.3s ease;
        }

        .feedback:hover {
          border-color: #1ee208ff;
        }

        .feedback h2 {
          font-size: 24px;
          margin-bottom: 15px;
          text-align: center;
          font-weight: 700;
        }

        .feedback h3 {
          font-size: 18px;
          margin-bottom: 20px;
          text-align: center;
          color: #bbb;
        }

        .feedback-stars {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .star {
          font-size: 30px;
          color: #585a58;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .star:hover {
          color: #ff6666;
          transform: scale(1.25);
        }

        .star.filled {
          color: #f50505;
        }

        .star.filled:hover {
          color: #ff6666;
        }

        .feedback-comment {
          width: 100%;
          min-height: 100px;
          background-color: #222;
          color: #fff;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #4caf50;
          font-size: 16px;
          resize: vertical;
          margin-bottom: 10px;
          box-sizing: border-box; /* Garante que padding não afete a largura total */
        }

        .feedback-comment:focus {
          outline: none;
          border-color: #f50505;
        }

        .char-count {
          font-size: 14px;
          color: #bbb;
          text-align: right;
          margin-bottom: 10px;
        }

        .feedback-submit {
          width: 100%;
          padding: 12px 24px;
          background-color: #4caf50;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .feedback-submit:hover:not(:disabled) {
          background-color: #f50505;
          box-shadow: 0 0 15px rgba(245, 5, 5, 0.5);
          transform: translateY(-2px);
        }

        .feedback-submit:disabled {
          background-color: #585a58;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .feedback-submitted {
          text-align: center;
          padding: 20px;
          background-color: #222;
          border-radius: 5px;
        }

        .feedback-submitted .thank-you-message {
          font-size: 18px;
          color: #4caf50;
        }

        .feedback-submitted .submitted-rating,
        .feedback-submitted .submitted-comment {
            color: #fff;
            margin-top: 0.5rem;
            word-break: break-word;
        }

        .feedback-warning {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ffcc00;
          color: #333;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: bold;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          animation: fadeInOut 3s ease forwards;
        }

        .submission-error {
          color: #ef4444;
          background-color: rgba(153, 27, 27, 0.2);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 1rem;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
      {warning && (
          <div className="feedback-warning">
              {warning}
          </div>
      )}
      <div className="feedback-container">
          <section className="feedback">
              <h2>Deixe seu Feedback</h2>
              <h3>(Isso me ajuda a evoluir)</h3>

              {submitted ? (
                  <div className="feedback-submitted animate-fadeIn">
                      <p className="thank-you-message">Seu feedback foi enviado com sucesso!</p>
                      <p className="submitted-rating">
                          <strong>Sua avaliação:</strong> {"★".repeat(rating)}{"☆".repeat(5-rating)}
                      </p>
                      <p className="submitted-comment">
                          <strong>Seu comentário:</strong> {comment}
                      </p>
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
                          required
                      />
                      <p className="char-count">{comment.length}/1000</p>
                      {submissionError && (
                          <div className="submission-error">
                              {submissionError}
                          </div>
                      )}
                      <button
                          type="submit"
                          className="feedback-submit"
                          disabled={rating === 0 || !comment.trim() || isLoading}
                      >
                          {isLoading ? 'Enviando...' : 'Enviar Feedback'}
                      </button>
                  </form>
              )}
          </section>
      </div>
    </>
  );
};

export default Feedback;


import React, { useState, useEffect } from "react";
import "../styles//feedback.css";

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [warning, setWarning] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState("");

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

    const normalizeText = (text) =>
        text
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/(.)\1+/g, "$1");

    const replaceBadWords = (text) => {
        let filteredText = text;
        const foundBadWords = [];

        for (const badWord in badWords) {
            const regex = new RegExp(`\\b${badWord}\\b`, "gi");
            if (text.match(regex)) {
                if (!foundBadWords.includes(badWord.toUpperCase())) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating > 0 && comment.trim()) {
            setIsLoading(true);
            setSubmissionError("");

            const feedbackData = {
                userFeedback: comment,
                userRating: rating,
            };

            try {
                const response = await fetch('https://microservice-feedback.onrender.com/feedback/criar-feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feedbackData),
                });

                if (response.ok) {
                    setSubmitted(true);
                } else {
                    setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
                setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <div className="feedback-container">
                <section className="feedback">
                    <h2>Deixe seu Feedback</h2>
                    <h3>(Isso me ajuda a evoluir)</h3>

                    {submitted ? (
                        <div className="feedback-submitted animate-fadeIn">
                            <p className="thank-you-message">Seu feedback foi enviado com sucesso!</p>
                            <p className="submitted-rating">
                                <strong>Sua avaliação:</strong> {"★".repeat(rating)}{"☆".repeat(5 - rating)}
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
            {warning && (
                <div className="feedback-warning">
                    {warning}
                </div>
            )}
        </>
    );
};

export default Feedback;

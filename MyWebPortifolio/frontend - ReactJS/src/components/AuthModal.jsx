import React, { useState } from "react";
import "../styles/authmodal.css";

// URLs da API centralizadas
const API_URLS = {
  login: "https://apigateway-qao8.onrender.com/api/auth/login",
  register: "https://apigateway-qao8.onrender.com/api/users/register",
};

// Função utilitária para requisições com retry
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && response.status <= 502 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Número máximo de tentativas excedido.");
};

const AuthModal = ({ handleLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    password: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Valida o campo de nome em tempo real
  const isNameValid = formData.name && /^[a-zA-Z\s\-\']+$/.test(formData.name);
  const isUserNameValid = formData.userName.length > 0;
  const isPasswordValid = formData.password.length >= 5 && formData.password.length <= 20;

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && value && !/^[a-zA-Z\s\-\']*$/.test(value)) {
      setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
      return;
    }
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  // Muda entre abas (login/cadastro) e limpa o estado
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ name: "", userName: "", password: "", email: "" });
    setError("");
    setSuccessMessage("");
  };

  // Valida os dados do formulário
  const validateForm = (isLogin) => {
    if (!formData.userName || !formData.password) {
      setError("Nome de usuário e senha são obrigatórios.");
      return false;
    }
    if (formData.password.length < 5 || formData.password.length > 20) {
      setError("A senha deve ter entre 5 e 20 caracteres.");
      return false;
    }
    if (!isLogin && !formData.name) {
      setError("O nome é obrigatório para o cadastro.");
      return false;
    }
    if (!isLogin && !/^[a-zA-Z\s\-\']+$/.test(formData.name)) {
      setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
      return false;
    }
    return true;
  };

  // Envia o formulário (login ou cadastro)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const isLogin = activeTab === "login";
    if (!validateForm(isLogin)) {
      setIsLoading(false);
      return;
    }

    try {
      const url = isLogin ? API_URLS.login : API_URLS.register;
      const payload = isLogin
        ? { userName: formData.userName, password: formData.password }
        : {
            name: formData.name,
            userName: formData.userName,
            password: formData.password,
            email: formData.email,
          };

      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.status === false && data.erro?.message
            ? data.erro.message
            : response.status >= 500
            ? "Servidor indisponível após várias tentativas."
            : response.status === 401 || response.status === 403
            ? "Credenciais inválidas, tente novamente."
            : "Ocorreu um erro desconhecido."
        );
        setIsLoading(false);
        return;
      }

      if (data.status === true) {
        if (isLogin) {
          handleLoginSuccess({ token: data.dados?.token || data.token });
          onClose();
        } else {
          setSuccessMessage(
            `Cadastro realizado com sucesso, ${data.dados.nome || "usuário"}! Bem-vindo(a)!`
          );
          setTimeout(() => handleTabChange("login"), 3000);
        }
      } else {
        setError("Resposta inesperada do servidor.");
      }
    } catch (error) {
      setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="container-modal">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Fechar modal"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{activeTab === "login" ? "Entrar" : "Criar Conta"}</h2>
          {isLoading && <div className="loading-bar" />}
          {activeTab === "register" && (
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-label="Nome completo"
                  aria-invalid={error && formData.name ? "true" : "false"}
                  className={isNameValid ? "valid" : ""}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userName">Nome de Usuário</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                aria-label="Nome de usuário"
                aria-invalid={error && formData.userName ? "true" : "false"}
                className={isUserNameValid ? "valid" : ""}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={20}
                aria-label="Senha"
                aria-invalid={error && formData.password ? "true" : "false"}
                className={isPasswordValid ? "valid" : ""}
              />
            </div>
          </div>

          {activeTab === "register" && (
            <div className="form-group">
              <label htmlFor="email">Email (opcional)</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-label="Endereço de email"
                />
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : activeTab === "login" ? (
              "Entrar"
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
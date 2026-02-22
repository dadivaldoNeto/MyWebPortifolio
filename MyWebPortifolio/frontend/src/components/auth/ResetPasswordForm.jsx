import React from "react";

const ResetPasswordForm = ({ formData, handleChange, isPasswordValid }) => {
  // Lógica para mostrar o "X" vermelho se o usuário começou a digitar, mas ainda não está válido
  const showInvalid = formData.password.length > 0 && !isPasswordValid;
  // Lógica para mostrar o "V" verde se a senha atende a todos os requisitos
  const showValid = formData.password.length > 0 && isPasswordValid;

  return (
    <div className="reset-password-view animate-fadeIn">
      
      {/* Texto introdutório limpo, sem styles inline bagunçados */}
      <p className="input-helper-text" style={{ marginBottom: "20px", color: "#e0e0e0" }}>
        Quase lá! Agora crie uma nova senha de acesso segura.
      </p>

      <div className="form-group">
        <label>Nova Senha</label>
        
        {/* O input-wrapper é obrigatório para os ícones ✓ e ✕ aparecerem no CSS */}
        <div className="input-wrapper">
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Digite sua nova senha"
            required 
            className={showValid ? "valid" : ""} 
            aria-invalid={showInvalid ? "true" : "false"}
          />
        </div>

        {/* Regras da senha transformadas em uma lista visualmente agradável */}
        <div className="input-helper-text">
          <p>Sua senha deve conter no mínimo 8 caracteres, incluindo:</p>
          <ul style={{ margin: "6px 0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            <li style={{ color: formData.password.match(/[A-Z]/) ? "#48bb78" : "inherit" }}>Letra maiúscula</li>
            <li style={{ color: formData.password.match(/[a-z]/) ? "#48bb78" : "inherit" }}>Letra minúscula</li>
            <li style={{ color: formData.password.match(/[0-9]/) ? "#48bb78" : "inherit" }}>Número</li>
            <li style={{ color: formData.password.match(/[@$!%*?&]/) ? "#48bb78" : "inherit" }}>Caractere especial (ex: @, $, !, %)</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default ResetPasswordForm;
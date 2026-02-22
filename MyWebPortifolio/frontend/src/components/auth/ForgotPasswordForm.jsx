import React from "react";

const ForgotPasswordForm = ({ formData, handleChange }) => {
  return (
    <div className="forgot-password-view animate-fadeIn">
      <div className="form-group">
        <label>Usuário ou E-mail</label>
        <input 
          type="text" 
          name="userName" 
          value={formData.userName} 
          onChange={handleChange} 
          placeholder="Ex: seuusuario ou email@dominio.com"
          required 
        />
        
        {/* Instrução clara diretamente abaixo do campo */}
        <div className="input-helper-text">
          <p>
            Digite seu nome de usuário ou e-mail cadastrado. Enviaremos um código de 6 dígitos para você redefinir sua senha.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
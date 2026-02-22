import React from "react";

const VerifyRecoveryForm = ({ formData, handleChange, maskedEmail }) => {
  return (
    <div className="verify-view animate-fadeIn">
      <div className="form-group">
        <label>Código de 6 dígitos</label>
        <input 
          type="text" 
          name="code" 
          value={formData.code} 
          onChange={handleChange} 
          placeholder="000000" 
          maxLength="6" 
          required 
          className="code-input text-center" 
          autoComplete="off"
        />
        
        {/* Agrupamento das mensagens de contexto abaixo do input */}
        <div className="input-helper-text">
          <p>
            Enviamos um código de segurança para <strong>{maskedEmail || formData.userName}</strong>
          </p>
          <p className="warning-text">⏳ O código expira em 5 minutos.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyRecoveryForm;
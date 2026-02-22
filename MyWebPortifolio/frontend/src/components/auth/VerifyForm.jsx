import React from "react";

const VerifyForm = ({ formData, handleChange, resendTimer, handleResendCode }) => {
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
          <p>Enviamos um código para <strong>{formData.email}</strong></p>
          <p className="warning-text">⏳ O código expira em 5 minutos.</p>
        </div>
      </div>

      <div className="form-actions-secondary">
        <button 
          type="button" 
          className="resend-button" 
          disabled={resendTimer > 0} 
          onClick={handleResendCode}
        >
          {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : "Reenviar Código"}
        </button>
      </div>
    </div>
  );
};

export default VerifyForm;
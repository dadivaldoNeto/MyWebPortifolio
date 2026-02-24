import React from "react";
import "../../styles/authmodal.css";

const RegisterForm = ({ formData, handleChange, isNameValid, isUserNameValid, isPasswordValid, isEmailValid }) => {
  return (
    <>
      <div className="form-group">
        <label>Nome</label>
        <div className="input-wrapper">
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formData.name && isNameValid ? "valid" : ""} />
        </div>
        <div className="instruction-message">Nome deve ter 5-100 caracteres, apenas letras, espaços, hífens ou apóstrofos.</div>
      </div>
      
      <div className="form-group">
        <label>Usuário</label>
        <div className="input-wrapper">
          <input type="text" name="userName" value={formData.userName} onChange={handleChange} required className={formData.userName && isUserNameValid ? "valid" : ""} />
        </div>
        <div className="instruction-message">Nome de usuário deve ter 5-20 caracteres, sem espaços.</div>
      </div>
      
      <div className="form-group">
        <label>Senha</label>
        <div className="input-wrapper">
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className={formData.password && isPasswordValid ? "valid" : ""} />
        </div>
        <div className="instruction-message">Senha deve ter no mínimo 8 caracteres, com Maiúscula, Minúscula, Número e Especial.</div>
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <div className="input-wrapper">
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={formData.email && isEmailValid ? "valid" : ""} />
        </div>
        <div className="instruction-message">Email deve ser válido e sem espaços (obrigatório).</div>
      </div>
    </>
  );
};

export default RegisterForm;
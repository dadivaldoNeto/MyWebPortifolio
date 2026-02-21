import React, { useState } from "react";
import "../styles/editprofile.css"; 

const EditProfile = ({ onClose, userName }) => {
  // Estado inicial com a imagem neutra (silhueta)
  const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [fotoUrl, setFotoUrl] = useState(defaultImage);
  
  const [telefone, setTelefone] = useState("");
  const [pais, setPais] = useState("");
  const [cidade, setCidade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bio, setBio] = useState("");

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados salvos:", { telefone, pais, cidade, profissao, github, linkedin, bio });
    onClose(); 
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-header">
        <h2>Editar Perfil</h2>
        <button className="btn-close" onClick={onClose}>✕ Fechar</button>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        
        {/* FOTO DE PERFIL */}
        <div className="foto-upload-section">
          <div className="foto-preview">
            <img src={fotoUrl} alt="Avatar" />
            <div className="foto-overlay">
              <span>📷 Alterar</span>
            </div>
            <input type="file" accept="image/*" onChange={handleFotoChange} title="Escolha uma foto" />
          </div>
        </div>

        {/* GRID ALARGADO */}
        <div className="form-grid">
          {/* CAMPOS BLOQUEADOS */}
          <div className="input-group disabled">
            <label>Username (Não editável)</label>
            <input type="text" value={userName || "brunofdev"} disabled />
          </div>
          <div className="input-group disabled">
            <label>E-mail (Não editável)</label>
            <input type="email" value="bruno@email.com" disabled />
          </div>

          {/* CAMPOS EDITÁVEIS */}
          <div className="input-group">
            <label>Profissão / Título</label>
            <input type="text" value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Ex: Desenvolvedor Backend" />
          </div>
          <div className="input-group">
            <label>Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="input-group">
            <label>País</label>
            <input type="text" value={pais} onChange={(e) => setPais(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Cidade</label>
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div className="input-group">
            <label>GitHub (URL)</label>
            <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/seu-usuario" />
          </div>
          <div className="input-group">
            <label>LinkedIn (URL)</label>
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/seu-perfil" />
          </div>
        </div>

        {/* BIO OCUPANDO A LARGURA TOTAL */}
        <div className="input-group bio-group">
          <label>Sobre mim (Bio)</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            rows="5" 
            placeholder="Conte um pouco sobre suas habilidades e objetivos..."
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-save">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
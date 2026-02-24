import React, { useState, useEffect, useRef } from "react";
import "../../styles/manageprojects.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
// Chaves do Cloudinary (Necessárias para o salvamento final funcionar)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "SEU_UPLOAD_PRESET";

const ManageProjects = () => {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Refs para controlar o Drag & Drop de forma fluida
  const dragItem = useRef();
  const dragOverItem = useRef();

  const [formData, setFormData] = useState({
    titulo: "", descricao: "", tecnologias: "", repositorioUrl: "", liveUrl: "",
    status: "Concluído", dataProjeto: "", papel: "",
    imagens: [] // Agora guarda objetos: { file: File (se for nova), url: String (preview ou definitiva) }
  });
//
  useEffect(() => { fetchProjetos(); }, []);

  const fetchProjetos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/projetos`);
      if (response.ok) {
        const data = await response.json();
        setProjetos(data.dados || data || []); 
      }
    } catch (error) { console.error("Erro:", error); }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // =========================================================
  // 📸 1. SELEÇÃO INSTANTÂNEA (PREVIEW LOCAL)
  // =========================================================
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const novasImagens = files.map(file => ({
      file: file, // Guarda o arquivo físico para upar só na hora de salvar
      url: URL.createObjectURL(file), // Cria um link virtual instantâneo para a tela
      isNova: true
    }));

    setFormData((prev) => ({ ...prev, imagens: [...prev.imagens, ...novasImagens] }));
  };

  // =========================================================
  // 🖱️ 2. SISTEMA DRAG & DROP (ARRASTAR E SOLTAR)
  // =========================================================
  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const drop = (e) => {
    const copyListItems = [...formData.imagens];
    const dragItemContent = copyListItems[dragItem.current];
    // Remove o item da posição original e insere na nova posição
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setFormData({ ...formData, imagens: copyListItems });
  };

  // Define como Capa (Joga para o topo da lista [0])
  const setAsCover = (index) => {
    if (index === 0) return;
    const novasImagens = [...formData.imagens];
    const item = novasImagens.splice(index, 1)[0];
    novasImagens.unshift(item); 
    setFormData({ ...formData, imagens: novasImagens });
  };

  const removeImage = (index) => {
    const novasImagens = formData.imagens.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens: novasImagens });
  };

  // =========================================================
  // 🚀 3. SALVAMENTO (UPLOAD NUVEM -> JAVA)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imagens.length === 0) {
      showMessage("error", "Adicione pelo menos uma imagem e defina a Capa.");
      return;
    }

    setLoading(true);
    showMessage("success", "⏳ Iniciando upload das imagens para a nuvem...");

    try {
      // 1. FAZ O UPLOAD APENAS DAS IMAGENS NOVAS
      const imagensProcessadas = await Promise.all(
        formData.imagens.map(async (img) => {
          if (!img.isNova) return img.url; // Já era uma URL antiga da nuvem

          const formUpload = new FormData();
          formUpload.append("file", img.file);
          formUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

          const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formUpload });
          const data = await res.json();
          
          if (!data.secure_url) throw new Error("Falha ao subir imagem. Verifique as chaves do Cloudinary.");
          return data.secure_url; // Retorna o link definitivo
        })
      );

      showMessage("success", "✅ Upload concluído! Salvando no banco de dados...");

      // 2. MONTA O PAYLOAD PARA O SEU JAVA
      const galeriaComOrdem = imagensProcessadas.map((url, index) => ({
        urlImagem: url,
        ordemExibicao: index,
        isCapa: index === 0
      }));

      const payload = { ...formData, galeria: galeriaComOrdem };
      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing ? `${BASE_URL}/projetos/${editId}` : `${BASE_URL}/projetos`;

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMessage("success", isEditing ? "🎉 Projeto atualizado!" : "🎉 Projeto publicado com sucesso!");
        resetForm();
        fetchProjetos();
      } else { 
        showMessage("error", "Erro ao salvar no banco de dados."); 
      }
    } catch (error) { 
      console.error(error);
      showMessage("error", "❌ " + error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setFormData({ titulo: "", descricao: "", tecnologias: "", repositorioUrl: "", liveUrl: "", status: "Concluído", dataProjeto: "", papel: "", imagens: [] });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (projeto) => {
    setIsEditing(true);
    setEditId(projeto.id);
    let imagensFormatadas = [];
    if (projeto.galeria && projeto.galeria.length > 0) {
      imagensFormatadas = [...projeto.galeria]
        .sort((a, b) => a.ordemExibicao - b.ordemExibicao)
        .map(img => ({ url: img.urlImagem, isNova: false })); // Reconstrói o formato
    }
    setFormData({
      titulo: projeto.titulo || "", descricao: projeto.descricao || "", tecnologias: projeto.tecnologias || "",
      status: projeto.status || "Concluído", papel: projeto.papel || "", dataProjeto: projeto.dataProjeto || "",
      repositorioUrl: projeto.repositorioUrl || "", liveUrl: projeto.liveUrl || "",
      imagens: imagensFormatadas 
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto para sempre?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/projetos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) {
        showMessage("success", "Projeto excluído com sucesso!");
        fetchProjetos();
      } else { showMessage("error", "Erro ao excluir."); }
    } catch (error) { showMessage("error", "Erro de conexão."); }
  };

  return (
    <div className="manage-projects-container" style={{ width: '100%' }}>
      <div className="admin-form-section">
        <div className="section-header">
          <h2>{isEditing ? "✏️ Editar Projeto" : "🚀 Adicionar Novo Projeto"}</h2>
          {isEditing && <button className="btn-cancel-small" onClick={resetForm}>Cancelar Edição</button>}
        </div>
        
        {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          {/* ... (DADOS BÁSICOS IGUAIS AO ANTERIOR) ... */}
          <div className="form-card">
            <h3>📝 Informações do Projeto</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Título do Projeto *</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Tecnologias *</label>
                <input type="text" name="tecnologias" value={formData.tecnologias} onChange={handleChange} placeholder="React, Java, Spring..." required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status do Projeto</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '14px', background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}>
                  <option value="Concluído">Concluído</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Pausado">Pausado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Meu Papel (Role)</label>
                <input type="text" name="papel" value={formData.papel} onChange={handleChange} placeholder="Ex: Desenvolvedor Full Stack" />
              </div>
              <div className="form-group">
                <label>Data / Período</label>
                <input type="month" name="dataProjeto" value={formData.dataProjeto} onChange={handleChange} style={{ padding: '12px', background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '8px' }}/>
              </div>
            </div>
            <div className="form-group">
              <label>Descrição Detalhada *</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="4" required></textarea>
            </div>
          </div>

          {/* 👇 O NOVO CANVAS DRAG AND DROP */}
          <div className="form-card media-card">
            <h3>🖼️ Galeria de Imagens (Arraste para organizar)</h3>
            <div className="upload-zone">
              <input type="file" multiple accept="image/*" id="file-upload" onChange={handleFileUpload} />
              <label htmlFor="file-upload" className="upload-label">
                ☁️ Clique ou Arraste imagens aqui
              </label>
            </div>

            {formData.imagens.length > 0 && (
              <div className="image-manager-grid">
                {formData.imagens.map((imgObj, index) => (
                  <div 
                    key={index} 
                    className={`image-thumbnail-box ${index === 0 ? "is-cover" : ""}`}
                    draggable // TORNA O ITEM ARRASTÁVEL
                    onDragStart={(e) => dragStart(e, index)}
                    onDragEnter={(e) => dragEnter(e, index)}
                    onDragEnd={drop}
                    onDragOver={(e) => e.preventDefault()} // Necessário para permitir o Drop
                  >
                    {index === 0 && <span className="cover-badge">★ CAPA</span>}
                    <img src={imgObj.url} alt={`Preview ${index}`} className="thumbnail-img" />
                    <div className="thumbnail-actions">
                      <button type="button" onClick={() => setAsCover(index)} title="Definir Capa">⭐</button>
                      <button type="button" className="btn-trash" onClick={() => removeImage(index)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-card">
            <h3>🔗 Links Externos</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Repositório (GitHub) *</label>
                <input type="url" name="repositorioUrl" value={formData.repositorioUrl} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Site Online (Live Preview)</label>
                <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-mega" disabled={loading}>
            {loading ? "Processando..." : (isEditing ? "Atualizar Projeto" : "Publicar Projeto")}
          </button>
        </form>
      </div>

      <div className="admin-list-section">
        <h2 style={{color: '#fff', marginBottom: '20px', paddingLeft: '20px'}}>📚 Projetos Cadastrados ({projetos.length})</h2>
        {loading && projetos.length === 0 ? <p style={{paddingLeft: '20px'}}>Carregando projetos...</p> : (
          <div className="projects-grid-admin">
            {projetos.map((proj) => {
              const imagemCapaObj = proj.galeria?.find(img => img.isCapa) || proj.galeria?.[0];
              const capaUrl = imagemCapaObj ? imagemCapaObj.urlImagem : "https://via.placeholder.com/300x150?text=Sem+Imagem";

              return (
                <div key={proj.id} className="project-card-admin">
                  <img src={capaUrl} alt={proj.titulo} className="project-card-img" />
                  <div className="project-card-content">
                    <h3>{proj.titulo}</h3>
                    <p className="tech-stack">{proj.tecnologias}</p>
                    <div className="project-card-actions">
                      <button onClick={() => handleEditClick(proj)} className="btn-edit">Editar</button>
                      <button onClick={() => handleDelete(proj.id)} className="btn-delete">Excluir</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {projetos.length === 0 && !loading && <p className="no-projects" style={{paddingLeft: '20px'}}>Nenhum projeto cadastrado ainda.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
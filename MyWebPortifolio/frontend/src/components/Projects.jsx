import React, { useState, useEffect } from "react";
import "../styles/projects.css";
import Modal from "./Modal";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Controle do Carrossel de Imagens dentro do Modal
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. CARREGAR PROJETOS DA API PÚBLICA
  useEffect(() => {
    const fetchPublicProjects = async () => {
      try {
        const response = await fetch(`${BASE_URL}/public/projetos`);
        const data = await response.json();

        if (response.ok) {
          setProjects(data.dados || []);
        } else {
          throw new Error(data.message || "Erro ao carregar os projetos.");
        }
      } catch (err) {
        console.error("Erro na vitrine:", err);
        setError("Não foi possível carregar os projetos no momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProjects();
  }, []);

  // 2. NAVEGAÇÃO DOS PROJETOS (Modal)
  const openModal = (index) => {
    setCurrentIndex(index);
    setCurrentImageIndex(0); // Reseta o carrossel de imagens sempre que abrir um novo projeto
    setIsModalOpen(true);
  };

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
    setCurrentImageIndex(0);
  };
  
  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setCurrentImageIndex(0);
  };

  // 3. NAVEGAÇÃO DO CARROSSEL DE IMAGENS
  const activeProject = projects[currentIndex];
  
  const nextImage = () => {
    if (activeProject?.galeria) {
      setCurrentImageIndex((prev) => (prev + 1) % activeProject.galeria.length);
    }
  };

  const prevImage = () => {
    if (activeProject?.galeria) {
      setCurrentImageIndex((prev) => (prev - 1 + activeProject.galeria.length) % activeProject.galeria.length);
    }
  };

  if (loading) return <div className="projects-loading">Iniciando sistemas...</div>;
  if (error) return <div className="projects-error">⚠️ {error}</div>;

  return (
    <section className="projects">
      <h2>Projetos em Destaque</h2>
      <svg width="0" height="0">
         {/* Filtro SVG mantido */}
         <filter id="static-noise">
           <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
           <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0" />
           <feComposite operator="in" in2="SourceGraphic" result="monoNoise"/>
           <feBlend mode="multiply" in="monoNoise" in2="SourceGraphic" result="blend"/>
         </filter>
      </svg>

      {/* GRID DE CAPAS */}
      <div className="projects-grid">
        {projects.map((project, index) => {
          // Busca a imagem de capa ou pega a primeira disponível
          const capaObj = project.galeria?.find(img => img.isCapa) || project.galeria?.[0];
          const capaUrl = capaObj ? capaObj.urlImagem : "https://via.placeholder.com/400?text=Sem+Imagem";

          return (
            <div key={project.id} className="project-item" onClick={() => openModal(index)}>
              <img src={capaUrl} alt={project.title} />
              <div className="project-title-overlay">{project.title}</div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALHADO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {activeProject && (
          <>
            <button className="nav-arrow left-arrow" onClick={prevProject}>&#8592;</button>
            <button className="nav-arrow right-arrow" onClick={nextProject}>&#8594;</button>

            <div className="modal-content">
              <h3 className="modal-title">{activeProject.title}</h3>

              {/* CARROSSEL DE IMAGENS DO PROJETO */}
              {activeProject.galeria && activeProject.galeria.length > 0 && (
                <div className="carousel-container" style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
                  <img 
                    src={activeProject.galeria[currentImageIndex].urlImagem} 
                    alt={`Galeria ${currentImageIndex + 1}`} 
                    style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '400px' }}
                  />
                  
                  {activeProject.galeria.length > 1 && (
                    <>
                      <button onClick={prevImage} style={carouselBtnStyleLeft}>‹</button>
                      <button onClick={nextImage} style={carouselBtnStyleRight}>›</button>
                      <div style={carouselCounterStyle}>
                        {currentImageIndex + 1} / {activeProject.galeria.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* VÍDEO (Se existir) */}
              {activeProject.video && (
                <iframe
                  width="100%" height="315" src={activeProject.video} title={activeProject.title}
                  frameBorder="0" allowFullScreen
                ></iframe>
              )}

              <div className="modal-description">
                <p className="main-desc">{activeProject.description}</p>
                
                {/* FICHA TÉCNICA DINÂMICA */}
                {activeProject.techs && (
                  <div className="tech-specs">
                    <h4>Ficha Técnica:</h4>
                    <ul>
                      {activeProject.techs.linguagem && <li><strong>Linguagem:</strong> {activeProject.techs.linguagem}</li>}
                      {activeProject.techs.paradigma && <li><strong>Paradigma:</strong> {activeProject.techs.paradigma}</li>}
                      {activeProject.techs.framework && <li><strong>Framework:</strong> {activeProject.techs.framework}</li>}
                      {activeProject.techs.bibliotecas && <li><strong>Bibliotecas:</strong> {activeProject.techs.bibliotecas}</li>}
                      {activeProject.techs.infraestrutura && <li><strong>Infraestrutura:</strong> {activeProject.techs.infraestrutura}</li>}
                    </ul>
                  </div>
                )}

                {/* COMO RODAR DINÂMICO */}
                {activeProject.setup && activeProject.setup.steps && activeProject.setup.steps.length > 0 && (
                  <div className="setup-section">
                    <h4>Como rodar e testar o projeto?</h4>
                    {activeProject.setup.obs && <p className="setup-obs">⚠️ {activeProject.setup.obs}</p>}
                    
                    <div className="terminal-box">
                      {activeProject.setup.steps.map((step) => (
                        <div key={step.num} className="step-item">
                          <p><strong>{step.num} &#10132;</strong> {step.text}</p>
                          {step.cmd && <code>{step.cmd}</code>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LINKS EXTERNOS */}
                <ul className="modal-links">
                  {activeProject.links && activeProject.links.map((link, idx) => (
                    <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
};

// Estilos inline simples para os botões do carrossel para não poluir muito o CSS principal
const carouselBtnStyleLeft = {
  position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.6)', color: '#4caf50', border: '1px solid #4caf50',
  borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const carouselBtnStyleRight = {
  ...carouselBtnStyleLeft, left: 'auto', right: '10px'
};

const carouselCounterStyle = {
  position: 'absolute', bottom: '10px', right: '10px',
  background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px',
  borderRadius: '15px', fontSize: '12px', border: '1px solid #4caf50'
};

export default Projects;
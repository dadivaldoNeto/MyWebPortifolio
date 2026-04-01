// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "./contexts/AuthContext"; 

// Layout
import MainLayout from "./components/MainLayout";

// Páginas
import Home from "./paginas/Home";
import AdminDashboard from "./paginas/AdminDashboard"; 
import ArticleViewer from "./paginas/ArticleViewer"; 
import EditProfile from "./components/compartilhado/header/EditProfile";
import ArticleShowcase from "./paginas/ArticleShowCase"; 

function App() {
  return (
    <AuthProvider> 
      <Routes>
        
        {/* ==========================================
            ROTAS COM HEADER E FOOTER (O Ciclo Completo)
            ========================================== */}
        <Route path="/" element={<MainLayout />}>
          
          <Route index element={<Home />} />
          
          <Route path="artigo/:slug" element={<ArticleViewer />} />
          
          <Route path="editar-perfil" element={<EditProfile />} />
          
          {/* 🚨 A CORREÇÃO: A Vitrine agora mora DENTRO do MainLayout! */}
          <Route path="artigos" element={<ArticleShowcase />} /> 

        </Route>

        {/* ==========================================
            ROTAS ISOLADAS (Sem Header Público)
            ========================================== */}
        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
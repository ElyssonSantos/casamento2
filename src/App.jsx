import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GiftsPage from './pages/GiftsPage';
import './styles/global.css';

function App() {
  // ACESSIBILIDADE GLOBAL
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('fontSize')) || 100);
  const [isBold, setIsBold] = useState(() => localStorage.getItem('isBold') === 'true');

  const updateAccessibility = (size, bold) => {
    if (size !== undefined) {
      setFontSize(size);
      localStorage.setItem('fontSize', size);
    }
    if (bold !== undefined) {
      setIsBold(bold);
      localStorage.setItem('isBold', bold);
    }
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    if (isBold) {
      document.body.classList.add('accessibility-bold');
    } else {
      document.body.classList.remove('accessibility-bold');
    }
  }, [fontSize, isBold]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage 
          fontSize={fontSize} 
          isBold={isBold} 
          updateAccessibility={updateAccessibility} 
        />} />
        <Route path="/gifts" element={<GiftsPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

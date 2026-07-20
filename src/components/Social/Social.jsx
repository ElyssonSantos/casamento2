import React from 'react';
import { Link } from 'react-router-dom';
import './Social.css';
import watermarkImg from '../../assets/watermark2.png';

const Social = () => {
    return (
        <footer className="social section-padding">
            <div className="container text-center">
                <div className="watermark-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <p style={{ fontSize: '18px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.85, margin: 0 }}>
                        INFORMAÇÕES LEGAIS
                    </p>
                    <a 
                        href="https://wa.me/5579998068464?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento."
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block' }}
                    >
                        <img 
                            src={watermarkImg} 
                            alt="Elysson Santos" 
                            style={{ maxHeight: '120px', maxWidth: '300px', width: 'auto', objectFit: 'contain' }}
                        />
                    </a>
                    <Link to="/admin" style={{ textDecoration: 'none', opacity: 0.2, marginTop: '5px' }}>🔒 Área Admin</Link>
                </div>
            </div>
        </footer>
    );
};

export default Social;


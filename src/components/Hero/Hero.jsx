import React, { useEffect, useState } from 'react';
import './Hero.css';

const Hero = ({ onRSVP }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className={`hero ${loaded ? 'loaded' : ''}`}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-names">Gabriel <span className="ampersand">&</span> Larissa</h1>
        <p className="hero-date">17 de Outubro • 15:00</p>
        <p className="hero-verse">"O amor tudo sofre, tudo crê, tudo espera, tudo suporta."</p>
        <p className="hero-verse-ref">1 Coríntios 13:7</p>

        <button className="cta-button" onClick={onRSVP}>
          Confirmar Presença
        </button>
      </div>

      <div className="scroll-indicator">
        <span>↓</span>
      </div>
    </section>
  );
};

export default Hero;

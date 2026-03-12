
import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const phrases = [
    { text: "O amor é paciente, o amor é bondoso.", reference: "1 Coríntios 13:4" },
    { text: "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.", reference: "Colossenses 3:14" },
    { text: "Assim, eles já não são dois, mas sim uma só carne.", reference: "Mateus 19:6" },
    { text: "Portanto, o que Deus uniu, ninguém o separe.", reference: "Marcos 10:9" },
    { text: "Nós amamos porque ele nos amou primeiro.", reference: "1 João 4:19" },
    { text: "O amor jamais acaba.", reference: "1 Coríntios 13:8" }
];

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [phraseIndex, setPhraseIndex] = useState(0);

    // Total duration in ms
    const DURATION = 12000;
    // Update interval in ms
    const INTERVAL = 100;

    useEffect(() => {
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = Math.min((elapsedTime / DURATION) * 100, 100);

            setProgress(newProgress);

            if (elapsedTime >= DURATION) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }

        }, INTERVAL);

        // Change phrases every 2.5 seconds (15s / 6 phrases = 2.5s)
        const phraseTimer = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, DURATION / phrases.length);

        return () => {
            clearInterval(timer);
            clearInterval(phraseTimer);
        };
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="heart-icon">🕊️</div>
                <div className="phrase-container" key={phraseIndex}>
                    <p className="phrase-text">"{phrases[phraseIndex].text}"</p>
                    <p className="phrase-reference">{phrases[phraseIndex].reference}</p>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="loading-text">Carregando...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;

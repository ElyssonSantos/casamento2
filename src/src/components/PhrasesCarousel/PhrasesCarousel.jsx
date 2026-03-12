import React, { useState, useEffect } from 'react';
import './PhrasesCarousel.css';

const phrases = [
    { text: "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.", author: "Colossenses 3:14" },
    { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", author: "1 Coríntios 13:4" },
    { text: "Assim, permanecem agora estes três: a fé, a esperança e o amor. O maior deles, porém, é o amor.", author: "1 Coríntios 13:13" },
    { text: "Nós amamos porque ele nos amou primeiro.", author: "1 João 4:19" }
];

const PhrasesCarousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % phrases.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="phrases-carousel section-padding">
            <div className="container">
                <div className="carousel-content fade-in" key={current}>
                    <p className="phrase-text">"{phrases[current].text}"</p>
                    <p className="phrase-author">— {phrases[current].author}</p>
                </div>

                <div className="carousel-indicators">
                    {phrases.map((_, index) => (
                        <span
                            key={index}
                            className={`indicator ${index === current ? 'active' : ''}`}
                            onClick={() => setCurrent(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PhrasesCarousel;

import React, { useEffect, useRef } from 'react';
import './EventDetails.css';

const EventDetails = () => {
    const cardsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-card');
                }
            });
        }, { threshold: 0.1 });

        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => {
            cardsRef.current.forEach((card) => {
                if (card) observer.unobserve(card);
            });
        };
    }, []);

    return (
        <section className="event-details section-padding" id="evento">
            <div className="event-details-glow"></div>
            <div className="container">
                <h2 className="section-title text-center title-neon" style={{ marginBottom: '3rem' }}>O Grande Dia</h2>

                <div className="details-wrapper">
                    <div className="details-info">

                        <div className="modern-card" ref={el => cardsRef.current[0] = el}>
                            <div className="neon-icon">📅</div>
                            <div className="detail-text">
                                <h3 className="elegant-title">Data</h3>
                                <p>17 de Outubro</p>
                                <p className="sub-text">Sábado</p>
                            </div>
                        </div>

                        <div className="modern-card" ref={el => cardsRef.current[1] = el}>
                            <div className="neon-icon">⏰</div>
                            <div className="detail-text">
                                <h3 className="elegant-title">Horário</h3>
                                <p>15:00 horas</p>
                                <p className="sub-text">Cerimônia e Recepção</p>
                            </div>
                        </div>

                        <div className="modern-card" ref={el => cardsRef.current[2] = el}>
                            <div className="neon-icon">📍</div>
                            <div className="detail-text">
                                <h3 className="elegant-title">Local</h3>
                                <p>R. João Dionízio dos Santos, 1412 - Mosqueiro</p>
                                <p className="sub-text">Parque Santo Antonio, Aracaju - SE (Chácara Mosqueiro)</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventDetails;

import React, { useState, useEffect } from 'react';
import './Countdown.css';

const Countdown = () => {
    const targetDate = new Date('2026-10-17T15:00:00');
    
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            } else {
                timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, []);

    const FlipUnit = ({ value, label }) => {
        // Formata para 2 dígitos se menor que 10
        const displayValue = value < 10 && label !== 'Dias' ? `0${value}` : value;
        
        return (
            <div className="flip-unit">
                <div className="flip-card" key={displayValue}>
                    <div className="flip-card-top">{displayValue}</div>
                    <div className="flip-card-bottom">{displayValue}</div>
                    <div className="flip-card-line"></div>
                </div>
                <span className="flip-label">{label}</span>
            </div>
        );
    };

    return (
        <section className="countdown-section section-padding">
            <div className="container">
                <h2 className="countdown-title">Contagem regressiva para o grande dia</h2>
                <div className="countdown-wrapper">
                    <FlipUnit value={timeLeft.days} label="Dias" />
                    <FlipUnit value={timeLeft.hours} label="Horas" />
                    <FlipUnit value={timeLeft.minutes} label="Minutos" />
                    <FlipUnit value={timeLeft.seconds} label="Segundos" />
                </div>
            </div>
        </section>
    );
};

export default Countdown;

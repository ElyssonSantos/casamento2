import React from 'react';
import './History.css';
// Scroll reveal handled in App.jsx globally

// I'll assume I create a hook or just use intersection observer in useEffect here.
// Actually, let's keep it simple with a library or custom hook. I'll create a simple hook file later or just put logic here.
// I'll put logic here for now to be self contained or create a utils file.

const History = () => {
    return (
        <section className="history section-padding" id="historia">
            <div className="container">
                <h2 className="section-title text-center">Nossa História</h2>

                <div className="timeline">
                    <div className="timeline-item left">
                        <div className="content reveal-on-scroll">
                            <h3>O Primeiro Olhar</h3>
                            <span className="date">2021</span>
                            <p>Nos conhecemos em um evento da igreja...</p>
                        </div>
                    </div>
                    <div className="timeline-item right">
                        <div className="content reveal-on-scroll">
                            <h3>O Pedido</h3>
                            <span className="date">2023</span>
                            <p>Foi um dia mágico onde dissemos nosso primeiro sim...</p>
                        </div>
                    </div>
                    <div className="timeline-item left">
                        <div className="content reveal-on-scroll">
                            <h3>O Grande Dia</h3>
                            <span className="date">17 Out 2026</span>
                            <p>Agora vamos selar nossa união diante de Deus e de vocês.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default History;

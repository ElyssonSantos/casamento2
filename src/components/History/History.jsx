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
               
                            <p>Gabriel e Larissa têm o prazer de convidar você para celebrar conosco nossa união, um momento em que a nossa família e amigos se unem para compartilhar da nossa alegria e amor.</p>
                        </div>
                    </div>
                    <div className="timeline-item right">
                        <div className="content reveal-on-scroll">
                            
                            <p>Em um momento especial, gostaríamos que pessoas especiais se fizessem presente, e não poderia ser de outra forma, pois vocês são muito importantes para nós e fazem parte da nossa história.</p>
                        </div>
                    </div>
                    <div className="timeline-item left">
                        <div className="content reveal-on-scroll">
                           
                            <p>Será um momento de amor e celebração! Contamos com a sua presença para tornar esse dia ainda mais importante. 
Com amor e gratidão,
Gabriel e Larissa!❤️</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default History;


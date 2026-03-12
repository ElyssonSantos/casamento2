import React from 'react';
import './Rules.css';

const Rules = () => {
    return (
        <section className="rules section-padding" id="informacoes">
            <div className="container">
                <h2 className="section-title text-center">Informações Importantes</h2>

                <div className="rules-grid">
                    <div className="rule-item">
                        <h3>👗 Dress Code</h3>
                        <p>Esporte Fino. Sinta-se elegante e confortável para celebrar conosco.</p>
                        <p className="note">Pedimos gentilmente que evitem a cor branca.</p>
                    </div>

                    <div className="rule-item">
                        <h3>⏰ Pontualidade</h3>
                        <p>A cerimônia iniciará pontualmente às 16:00. Chegue com 30 minutos de antecedência.</p>
                    </div>

                    <div className="rule-item">
                        <h3>🎁 Lista de Presentes</h3>
                        <p>Sua presença é nosso maior presente! Mas se quiser nos abençoar, teremos uma urna no local ou chave PIX.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Rules;

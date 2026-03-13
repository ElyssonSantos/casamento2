import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';

const GiftSection = () => {
    const navigate = useNavigate();
    
    return (
        <section className="gift-section-fixed section-padding">
            <div className="container">
                <h2 className="section-title text-center">Lista de Presentes</h2>

                <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666', lineHeight: '1.6' }}>
                    Acesse nossa página dedicada de presentes para ver todas as opções.
                </p>

                <button className="gift-cta" onClick={() => navigate('/gifts')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gift size={20} /> Ir para Lista de Presentes
                    </span>
                </button>
            </div>
        </section>
    );
};

export default GiftSection;

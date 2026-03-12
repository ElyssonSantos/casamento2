import React from 'react';
import './Gift.css';
import { Gift } from 'lucide-react';

const GiftSection = ({ onOpenDrawer }) => {
    return (
        <section className="gift-section-fixed section-padding">
            <div className="container">
                <h2 className="section-title text-center">Lista de Presentes</h2>

                <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666', lineHeight: '1.6' }}>
                    Acesse de forma mais rápida e segura a lista de presentes.
                </p>

                <button className="gift-cta" onClick={onOpenDrawer}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gift size={20} /> Ver Opções de Presente
                    </span>
                </button>
            </div>
        </section>
    );
};

export default GiftSection;

import React, { useEffect } from 'react';
import { X, Gift, ChevronRight } from 'lucide-react';
import './Gift.css';

const GiftDrawer = ({ isOpen, onClose }) => {

    // In a real app, these would be valid Pix keys or payment links
    const handlePixClick = (amount) => {
        // Example logic: Copy Pix key or Open Bank App
        // For now, we simulate opening a link
        // In mobile, this could deep link to a bank app if configured, or show a copy/paste modal
        alert(`Redirecionando para pagamento de R$ ${amount},00`);
    };

    const handleCustomValueClick = () => {
        // Redireciona para o app do banco ou área de transferência genérica
        alert("Redirecionando para seu app bancário para definir o valor...");
    };

    return (
        <>
            <div
                className={`gift-drawer-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <div className={`gift-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2>Lista de Presentes</h2>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>

                <div className="drawer-content">
                    <p className="gift-intro">
                        Criamos este espaço para quem desejar nos presentear de forma prática. <br />
                        Fique à vontade — sua presença é o que mais importa para nós. 💛
                    </p>

                    <div className="gift-options">
                        <button className="gift-btn" onClick={() => handlePixClick(50)}>
                            <Gift size={18} /> Presentear com R$ 50
                        </button>
                        <button className="gift-btn" onClick={() => handlePixClick(75)}>
                            <Gift size={18} /> Presentear com R$ 75
                        </button>
                        <button className="gift-btn" onClick={() => handlePixClick(100)}>
                            <Gift size={18} /> Presentear com R$ 100
                        </button>
                    </div>

                    <div className="custom-value-section">
                        <button className="custom-btn-simple" onClick={handleCustomValueClick}>
                            Definir outro valor <ChevronRight size={16} />
                        </button>

                        <p className="min-value-text">
                            Valor mínimo (50 reais)
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GiftDrawer;

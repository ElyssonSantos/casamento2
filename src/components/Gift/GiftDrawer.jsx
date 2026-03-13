import React from 'react';
import { X } from 'lucide-react';
import GiftContent from './GiftContent';
import './Gift.css';

const GiftDrawer = ({ isOpen, onClose }) => {
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
                    <GiftContent />
                </div>
            </div>
        </>
    );
};

export default GiftDrawer;
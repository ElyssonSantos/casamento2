import React, { useState } from 'react';
import { saveRSVP } from '../../services/rsvpService';
import './RSVPModal.css';

const RSVPModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.cpf) return;

        setStatus('loading');
        setErrorMessage('');

        // Save to API
        try {
            await saveRSVP(formData);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ name: '', cpf: '', phone: '' });
            }, 2000);
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                {status === 'success' ? (
                    <div className="success-message">
                        <div className="checkmark">✓</div>
                        <h3>Presença Confirmada!</h3>
                        <p>Mal podemos esperar para te ver lá.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="modal-title">Confirmar Presença</h2>
                        <p className="modal-subtitle">Por favor, preencha seus dados abaixo.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nome Completo *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: João Silva"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>CPF *</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Telefone / WhatsApp *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>

                            {status === 'error' && <p className="error-message">{errorMessage}</p>}

                            <button
                                type="submit"
                                className={`submit-button ${status === 'loading' ? 'loading' : ''}`}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Enviando...' : 'Confirmar'}
                            </button>

                            <p className="modal-footer-text">
                                * O convite é único e intransferível.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RSVPModal;

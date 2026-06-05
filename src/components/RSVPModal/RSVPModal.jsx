import React, { useState } from 'react';
import { saveRSVP } from '../../services/rsvpService';
import './RSVPModal.css';

const RELATIONSHIP_OPTIONS = [
    'Esposo(a)',
    'Namorado(a)',
    'Noivo(a)',
    'Irmão/Irmã',
    'Pai',
    'Mãe',
    'Padrasto',
    'Madrasta',
    'Filho(a)',
    'Tio(a)',
    'Primo(a)',
    'Avô/Avó',
    'Sogro(a)',
    'Cunhado(a)',
    'Amigo(a)',
    'Outro',
];

const RSVPModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: ''
    });
    const [familyCount, setFamilyCount] = useState(0);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFamilyCountChange = (e) => {
        const count = Math.max(0, Math.min(20, parseInt(e.target.value) || 0));
        setFamilyCount(count);

        setFamilyMembers(prev => {
            const updated = [...prev];
            if (count > updated.length) {
                for (let i = updated.length; i < count; i++) {
                    updated.push({ name: '', relationship: '' });
                }
            } else {
                updated.length = count;
            }
            return updated;
        });
    };

    const handleFamilyMemberChange = (index, field, value) => {
        setFamilyMembers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.cpf) return;

        // Validate family members if any
        if (familyCount > 0) {
            const incomplete = familyMembers.some(m => !m.name || !m.relationship);
            if (incomplete) {
                setStatus('error');
                setErrorMessage('Preencha o nome e o parentesco de todos os familiares.');
                return;
            }
        }

        setStatus('loading');
        setErrorMessage('');

        const payload = {
            ...formData,
            familyMembers: familyCount > 0 ? familyMembers : [],
            totalPeople: 1 + familyCount,
        };

        // Save to API
        try {
            await saveRSVP(payload);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ name: '', cpf: '', phone: '' });
                setFamilyCount(0);
                setFamilyMembers([]);
                if (onSuccess) onSuccess();
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
                                    maxLength={120}
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
                                    maxLength={14}
                                    pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
                                    title="CPF no formato 000.000.000-00"
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
                                    maxLength={20}
                                    required
                                />
                            </div>

                            {/* Family Members Section */}
                            <div className="family-section">
                                <div className="family-section-header">
                                    <span className="family-icon">👨‍👩‍👧‍👦</span>
                                    <h3>Acompanhantes / Família</h3>
                                </div>
                                <p className="family-subtitle">Quantas pessoas da sua família irão com você?</p>

                                <div className="form-group">
                                    <label>Quantidade de acompanhantes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={familyCount}
                                        onChange={handleFamilyCountChange}
                                        placeholder="0"
                                    />
                                </div>

                                {familyCount > 0 && (
                                    <div className="family-members-list">
                                        {familyMembers.map((member, index) => (
                                            <div className="family-member-card" key={index}>
                                                <span className="member-number">{index + 1}</span>
                                                <div className="member-fields">
                                                    <input
                                                        type="text"
                                                        placeholder={`Nome do acompanhante ${index + 1}`}
                                                        value={member.name}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                                                        maxLength={120}
                                                        required
                                                    />
                                                    <select
                                                        value={member.relationship}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                                                        required
                                                        className={member.relationship ? '' : 'placeholder-select'}
                                                    >
                                                        <option value="" disabled>Parentesco...</option>
                                                        {RELATIONSHIP_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {familyCount > 0 && (
                                    <p className="total-people-badge">
                                        Total de pessoas: <strong>{1 + familyCount}</strong>
                                    </p>
                                )}
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

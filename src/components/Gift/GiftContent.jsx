import React, { useState } from 'react';
import { Gift, ChevronRight, Upload, CheckCircle } from 'lucide-react';
import { registerDonation } from '../../services/rsvpService';

const GiftContent = () => {
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        cpf: '',
        amount: '',
        receipt: null
    });

    // 🔗 Links de pagamento
    const pixLinks = {
        70: "https://nubank.com.br/cobrar/3wb9a1/69abf074-f345-4322-b754-77228788a34e",
        100: "https://nubank.com.br/cobrar/3wb9a1/69abf0a6-4918-45e0-aec7-b71737e0140d",
        150: "https://nubank.com.br/cobrar/3wb9a1/69abf0b8-9a1a-4f91-bd90-fa75c8ef40b8"
    };

    const handlePixClick = (amount) => {
        const link = pixLinks[amount];
        if (link) window.open(link, "_blank");
        else alert("Link de pagamento não encontrado.");
    };

    const handleCustomValueClick = () => {
        window.open("https://nubank.com.br/cobrar/3wb9a1/69abf0cb-ef6c-44a3-bced-6a166aac4d02", "_blank");
    };

    const resetForm = () => {
        setShowDonationForm(false);
        setStatus('idle');
        setFormData({ cpf: '', amount: '', receipt: null });
        setErrorMessage('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, receipt: e.target.files[0] }));
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resolução suficiente para comprovantes
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Boa compressão
                    resolve(dataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDonationSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cpf || !formData.amount || !formData.receipt) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const base64Image = await compressImage(formData.receipt);
            
            const payload = {
                cpf: formData.cpf,
                amount: formData.amount,
                receipt: base64Image
            };

            await registerDonation(payload);
            setStatus('success');
            setTimeout(() => {
                resetForm();
            }, 3000);
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="gift-content-inner">
            {showDonationForm ? (
                <div className="donation-form-section">
                    {status === 'success' ? (
                        <div className="success-message" style={{textAlign: 'center', marginTop: '2rem'}}>
                            <CheckCircle size={48} color="green" style={{marginBottom: '1rem'}} />
                            <h3>Doação Registrada!</h3>
                            <p>Muito obrigado pelo presente. 💛</p>
                        </div>
                    ) : (
                        <>
                            <h3>Registrar Doação</h3>
                            <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem', textAlign: 'center'}}>
                                Já confirmou presença e fez o PIX? Envie seu comprovante para vincularmos ao seu nome.
                            </p>
                            
                            <form onSubmit={handleDonationSubmit}>
                                <div className="form-group">
                                    <label>CPF (usado na confirmação) *</label>
                                    <input 
                                        type="text" 
                                        name="cpf" 
                                        value={formData.cpf} 
                                        onChange={handleInputChange} 
                                        placeholder="000.000.000-00" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Valor Doado (R$) *</label>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        value={formData.amount} 
                                        onChange={handleInputChange} 
                                        placeholder="Ex: 150" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Comprovante (Imagem) *</label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                        required 
                                    />
                                </div>

                                {status === 'error' && <p style={{color: 'red', fontSize: '0.85rem'}}>{errorMessage}</p>}

                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Enviando...' : 'Enviar Comprovante'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => setShowDonationForm(false)}
                                >
                                    Cancelar
                                </button>
                            </form>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <p className="gift-intro">
                        Criamos este espaço para quem desejar nos presentear de forma prática. <br />
                        Fiquem à vontade — sua presença é o que mais importa para nós. 💛
                    </p>

                    <div className="gift-options">
                        <button className="gift-btn" onClick={() => handlePixClick(70)}>
                            <Gift size={18} /> Presentear com R$ 70
                        </button>

                        <button className="gift-btn" onClick={() => handlePixClick(100)}>
                            <Gift size={18} /> Presentear com R$ 100
                        </button>

                        <button className="gift-btn" onClick={() => handlePixClick(150)}>
                            <Gift size={18} /> Presentear com R$ 150
                        </button>
                    </div>

                    <div className="custom-value-section">
                        <button className="custom-btn-simple" onClick={handleCustomValueClick}>
                            Definir outro valor <ChevronRight size={16} />
                        </button>

                        <p className="min-value-text">
                            Valor mínimo (70 reais)
                        </p>
                        
                        <button className="register-donation-btn" onClick={() => setShowDonationForm(true)}>
                            <Upload size={16} /> Já fiz o PIX (Anexar comprovante)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GiftContent;

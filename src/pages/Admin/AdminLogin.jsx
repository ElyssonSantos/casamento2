import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // SEGURANÇA: Login via API server-side (senha NUNCA exposta no frontend)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL.replace('/rsvps', '')}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Erro ao fazer login');
                return;
            }

            // SEGURANÇA: Armazena token JWT (não uma flag booleana manipulável)
            sessionStorage.setItem('admin_token', data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-box">
                <h2>Área Restrita</h2>
                <p>Digite a senha para acessar</p>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={128}
                        disabled={loading}
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
                <button className="back-btn" onClick={() => navigate('/')}>Voltar ao Site</button>
            </div>
        </div>
    );
};

export default AdminLogin;

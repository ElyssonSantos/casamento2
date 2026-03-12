import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '171026') { // Simple password: Wedding Date
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Senha incorreta');
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
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Entrar</button>
                </form>
                <button className="back-btn" onClick={() => navigate('/')}>Voltar ao Site</button>
            </div>
        </div>
    );
};

export default AdminLogin;

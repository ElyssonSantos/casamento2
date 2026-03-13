import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GiftContent from '../components/Gift/GiftContent';
import '../components/Gift/Gift.css';

const GiftsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="gifts-page">
            <header className="gifts-page-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} /> Voltar para o Início
                </button>
            </header>

            <main className="gifts-page-content container">
                <div className="gifts-card">
                    <h1 className="gifts-title">Lista de Presentes</h1>
                    <GiftContent />
                </div>
            </main>

            <style>{`
                .gifts-page {
                    min-height: 100vh;
                    background-color: #fcfaf2;
                    padding-bottom: 50px;
                }
                .gifts-page-header {
                    padding: 20px;
                    background: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    margin-bottom: 30px;
                }
                .back-btn {
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--color-green);
                    font-weight: 600;
                    font-family: var(--font-body);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .back-btn:hover {
                    transform: translateX(-5px);
                }
                .gifts-card {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .gifts-title {
                    text-align: center;
                    font-size: 3rem;
                    margin-bottom: 20px;
                    color: var(--color-gold);
                }
                @media (max-width: 600px) {
                    .gifts-card {
                        padding: 20px;
                        box-shadow: none;
                        background: transparent;
                    }
                    .gifts-title {
                        font-size: 2.5rem;
                    }
                    .gifts-page-header {
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default GiftsPage;

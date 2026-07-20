import React from 'react';
import { Link } from 'react-router-dom';
import './Social.css';
import Watermark from '../Watermark';

const Social = () => {
    return (
        <footer className="social section-padding">
            <div className="container text-center">
                <h3>Acompanhe e use nossa hashtag</h3>
                <p className="hashtag">#GabrielELarissa</p>

                <div className="social-links">
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon"
                    >
                        📷 Instagram
                    </a>
                </div>

                <div
                    style={{
                        marginTop: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <h4
                        style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 600,
                            opacity: 0.8
                        }}
                    >
                        INFORMAÇÕES LEGAIS
                    </h4>

                    <Watermark />

                    <Link
                        to="/admin"
                        style={{
                            textDecoration: 'none',
                            opacity: 0.2,
                            fontSize: '1.2rem'
                        }}
                    >
                        🔒
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Social;

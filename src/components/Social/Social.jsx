import React from 'react';
import { Link } from 'react-router-dom';
import './Social.css';

const Social = () => {
    return (
        <footer className="social section-padding">
            <div className="container text-center">
                <h3>Acompanhe e use nossa hashtag</h3>
                <p className="hashtag">#GabrielELarissa</p>

                <div className="social-links">
                    <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                        Instagram
                    </a>
                </div>

                <p className="footer-note">
                    Feito Com Amor Por Elysson <Link to="/admin" style={{ textDecoration: 'none', opacity: 0.2, marginLeft: '10px' }}>🔒</Link>
                </p>
            </div>
        </footer>
    );
};

export default Social;


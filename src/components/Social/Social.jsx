import React from 'react';
import { Link } from 'react-router-dom';
import './Social.css';

const Social = () => {
    return (
        <footer className="social section-padding">
            <div className="container text-center">
                <p className="footer-note">
                    Feito Com Amor Por Elysson <Link to="/admin" style={{ textDecoration: 'none', opacity: 0.2, marginLeft: '10px' }}>🔒</Link>
                </p>
            </div>
        </footer>
    );
};

export default Social;


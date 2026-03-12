import React from 'react';
import './EventDetails.css';

const EventDetails = () => {
    return (
        <section className="event-details section-padding" id="evento">
            <div className="container">
                <h2 className="section-title text-center" style={{ marginBottom: '3rem' }}>O Grande Dia</h2>

                <div className="details-wrapper">
                    <div className="details-info">

                        <div className="detail-row">
                            <div className="detail-icon">📅</div>
                            <div className="detail-text">
                                <h3>Data</h3>
                                <p>17 de Outubro</p>
                                <p className="sub-text">Sábado</p>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-icon">⏰</div>
                            <div className="detail-text">
                                <h3>Horário</h3>
                                <p>15:00 horas</p>
                                <p className="sub-text">Cerimônia e Recepção</p>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-icon">📍</div>
                            <div className="detail-text">
                                <h3>Local</h3>
                                <p>A definir</p>
                                <p className="sub-text">Em breve</p>
                            </div>
                        </div>

                    </div>

                    {/* <div className="map-card">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.652!3d-23.561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzM5LjYiUyA0NsKwMzknMDcuMiJX!5e0!3m2!1sen!2sbr!4v1620000000000!5m2!1sen!2sbr"
                            title="Mapa do Local"
                            loading="lazy"
                            allowFullScreen=""
                        ></iframe>
                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default EventDetails;

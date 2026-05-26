import React from 'react';
import './ImportantInfo.css';
import { Clock, Users } from 'lucide-react';

const ImportantInfo = () => {
    return (
        <section className="important-info section-padding" id="informacoes">
            <div className="container">
                <h2 className="section-title text-center">Informações Importantes</h2>

                <div className="info-grid">
                    {/* Card 1: Horário */}
                    <div className="info-card reveal-on-scroll">
                        <div className="info-header">
                            <div className="info-icon">
                                <Clock size={20} color="#d4ac61" />
                            </div>
                            <h3>Horário da Cerimônia</h3>
                        </div>
                        <p>
                            A cerimônia começará às 15 horas em ponto. Pedimos aos convidados que não se atrasem, para que todo o restante da programação não seja prejudicado. A sua presença é importante do início ao fim, não queremos que você perca nenhum detalhe desse momento tão especial para nós!
                        </p>
                    </div>

                    {/* Card 3: Convidados */}
                    <div className="info-card reveal-on-scroll">
                        <div className="info-header">
                            <div className="info-icon">
                                <Users size={20} color="#d4ac61" />
                            </div>
                            <h3>Convidado não convida</h3>
                        </div>
                        <p>
                            Convidado não convida. Chamamos você por fazer parte de nossas vidas e por ser tão especial para o nós. Pedimos que não convide ou leve pessoas que não receberam o convite.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImportantInfo;


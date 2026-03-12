import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../../services/rsvpService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, LogOut, CheckCircle } from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, list: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('admin_auth');
        if (!auth) {
            navigate('/admin');
            return;
        }
        
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(197, 160, 89);
        doc.text('Confirmados - Gabriel & Larissa', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Total de Confirmados: ${stats.total}`, 20, 30);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 20, 36);

        // Table
        const tableColumn = ["#", "Nome", "CPF", "Telefone", "Doação", "Data de Conf. "];
        const tableRows = [];

        stats.list.forEach((confirmacao, index) => {
            const confirmData = [
                index + 1,
                confirmacao.name,
                confirmacao.cpf,
                confirmacao.phone,
                confirmacao.donation ? `R$ ${confirmacao.donation.amount}` : "Não registrada",
                new Date(confirmacao.date).toLocaleString()
            ];
            tableRows.push(confirmData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [94, 125, 99] }, // Green
        });

        doc.save('lista-confirmados.pdf');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Painel Administrativo</h1>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} /> Sair
                </button>
            </header>

            <div className="stats-cards">
                <div className="card">
                    <div className="card-icon"><CheckCircle size={32} /></div>
                    <div className="card-info">
                        <h3>Confirmados</h3>
                        <p className="big-number">{stats.total}</p>
                    </div>
                </div>
            </div>

            <div className="list-section">
                <div className="list-header">
                    <h2>Lista de Convidados</h2>
                    <button onClick={exportPDF} className="export-btn">
                        <Download size={18} /> Exportar PDF
                    </button>
                </div>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Doação Registrada</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.list.length > 0 ? (
                                stats.list.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.cpf}</td>
                                        <td>{item.phone}</td>
                                        <td>
                                            {item.donation ? (
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                                    <span style={{color: 'green', fontWeight: 'bold'}}>R$ {item.donation.amount}</span>
                                                    <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/rsvps', '') + item.donation.receiptUrl : `http://localhost:3001${item.donation.receiptUrl}`} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.8rem', color: '#5e7d63', textDecoration: 'underline'}}>Ver Comprovante</a>
                                                </div>
                                            ) : (
                                                <span style={{color: '#999'}}>Não registrada</span>
                                            )}
                                        </td>
                                        <td>{new Date(item.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">Nenhuma confirmação ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

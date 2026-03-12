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
        setStats(getStats());
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
        const tableColumn = ["#", "Nome", "Telefone", "Data de Confirmação"];
        const tableRows = [];

        stats.list.forEach((confirmacao, index) => {
            const confirmData = [
                index + 1,
                confirmacao.name,
                confirmacao.phone,
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
                                <th>Telefone</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.list.length > 0 ? (
                                stats.list.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.phone}</td>
                                        <td>{new Date(item.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-data">Nenhuma confirmação ainda.</td>
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

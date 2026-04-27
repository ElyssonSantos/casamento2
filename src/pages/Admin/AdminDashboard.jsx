import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, deleteRSVPByCPF } from '../../services/rsvpService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, LogOut, CheckCircle, Trash2 } from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, list: [] });
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        const auth = localStorage.getItem('admin_auth');
        if (!auth) {
            navigate('/admin');
            return;
        }

        fetchStats();
    }, [navigate]);

    const handleDelete = async (cpf, name) => {
        if (window.confirm(`Tem certeza que deseja excluir o RSVP de ${name}?`)) {
            try {
                await deleteRSVPByCPF(cpf);
                alert("RSVP excluído com sucesso!");
                fetchStats(); // Refresh data
            } catch (error) {
                alert("Erro ao excluir RSVP: " + error.message);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };

    const exportPDF = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(197, 160, 89);
            doc.text('Confirmados - Gabriel & Larissa', 20, 20);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Total de Confirmados: ${stats.total}`, 20, 30);
            doc.text(`Atualizado em: ${new Date().toLocaleDateString()}`, 20, 36);

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

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: { fillColor: [94, 125, 99] }, // Green
            });

            doc.save('lista-confirmados.pdf');
        } catch (error) {
            console.error(error);
            alert("Erro ao exportar PDF: " + error.message);
        }
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
                                <th>Ações</th>
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
                                                    <button onClick={() => setSelectedImage(item.donation.receiptUrl.startsWith('data:image') || item.donation.receiptUrl.startsWith('http') ? item.donation.receiptUrl : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/rsvps', '') + item.donation.receiptUrl : item.donation.receiptUrl))} style={{fontSize: '0.8rem', color: '#5e7d63', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Ver Comprovante</button>
                                                </div>
                                            ) : (
                                                <span style={{color: '#999'}}>Não registrada</span>
                                            )}
                                        </td>
                                        <td>{new Date(item.date).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(item.cpf, item.name)} 
                                                className="delete-btn"
                                                title="Excluir RSVP"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#e74c3c',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">Nenhuma confirmação ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        {selectedImage && (
            <div className="modal-overlay" onClick={() => setSelectedImage(null)} style={{zIndex: 9999}}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{padding: '30px 10px 10px', textAlign: 'center', position: 'relative', width: 'auto', maxWidth: '90%'}}>
                    <button onClick={() => setSelectedImage(null)} style={{position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333'}}>×</button>
                    <img src={selectedImage} alt="Comprovante" style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px'}} />
                </div>
            </div>
        )}
        </div>
    );
};

export default AdminDashboard;

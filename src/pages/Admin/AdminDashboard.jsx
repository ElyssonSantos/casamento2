import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, deleteRSVPByCPF } from '../../services/rsvpService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, LogOut, CheckCircle, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, list: [] });
    const [selectedImage, setSelectedImage] = useState(null);
    const [notification, setNotification] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const navigate = useNavigate();

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
                showNotification("RSVP excluído com sucesso!");
                fetchStats(); // Refresh data
            } catch (error) {
                showNotification("Erro ao excluir RSVP: " + error.message, 'error');
            }
        }
    };

    const toggleRow = (index) => {
        setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };

    // Calculate totals
    const totalPeopleCount = stats.list.reduce((sum, item) => sum + (item.totalPeople || 1), 0);

    const exportPDF = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(197, 160, 89);
            doc.text('Confirmados - Gabriel & Larissa', 20, 20);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Total de Confirmações: ${stats.total}`, 20, 30);
            doc.text(`Total de Pessoas: ${totalPeopleCount}`, 20, 36);
            doc.text(`Atualizado em: ${new Date().toLocaleDateString()}`, 20, 42);

            // Main Table
            const tableColumn = ["#", "Nome", "CPF", "Telefone", "Pessoas", "Doação", "Data"];
            const tableRows = [];

            stats.list.forEach((confirmacao, index) => {
                const confirmData = [
                    index + 1,
                    confirmacao.name,
                    confirmacao.cpf,
                    confirmacao.phone,
                    confirmacao.totalPeople || 1,
                    confirmacao.donation ? `R$ ${confirmacao.donation.amount}` : "Não registrada",
                    new Date(confirmacao.date).toLocaleString()
                ];
                tableRows.push(confirmData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 50,
                theme: 'grid',
                headStyles: { fillColor: [94, 125, 99] },
            });

            // Family Members Details
            let lastY = doc.lastAutoTable.finalY + 15;
            const familyEntries = stats.list.filter(item => item.familyMembers && item.familyMembers.length > 0);

            if (familyEntries.length > 0) {
                doc.setFontSize(16);
                doc.setTextColor(94, 125, 99);
                doc.text('Detalhes dos Acompanhantes', 20, lastY);
                lastY += 10;

                familyEntries.forEach(entry => {
                    if (lastY > 260) {
                        doc.addPage();
                        lastY = 20;
                    }

                    doc.setFontSize(11);
                    doc.setTextColor(50);
                    doc.text(`Família de: ${entry.name}`, 20, lastY);
                    lastY += 6;

                    const familyTableColumn = ["#", "Nome", "Parentesco"];
                    const familyTableRows = entry.familyMembers.map((m, i) => [
                        i + 1, m.name, m.relationship
                    ]);

                    autoTable(doc, {
                        head: [familyTableColumn],
                        body: familyTableRows,
                        startY: lastY,
                        theme: 'grid',
                        headStyles: { fillColor: [197, 160, 89] },
                        styles: { fontSize: 9 },
                        margin: { left: 25 },
                    });

                    lastY = doc.lastAutoTable.finalY + 10;
                });
            }

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
                        <h3>Confirmações</h3>
                        <p className="big-number">{stats.total}</p>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon"><Users size={32} /></div>
                    <div className="card-info">
                        <h3>Total de Pessoas</h3>
                        <p className="big-number">{totalPeopleCount}</p>
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
                                <th>Pessoas</th>
                                <th>Doação Registrada</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.list.length > 0 ? (
                                stats.list.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <tr className={expandedRows[index] ? 'row-expanded' : ''}>
                                            <td>{item.name}</td>
                                            <td>{item.cpf}</td>
                                            <td>{item.phone}</td>
                                            <td>
                                                <div className="people-cell">
                                                    <span className="people-badge">{item.totalPeople || 1}</span>
                                                    {item.familyMembers && item.familyMembers.length > 0 && (
                                                        <button
                                                            onClick={() => toggleRow(index)}
                                                            className="expand-btn"
                                                            title="Ver acompanhantes"
                                                        >
                                                            {expandedRows[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
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
                                        {/* Expanded Family Members Row */}
                                        {expandedRows[index] && item.familyMembers && item.familyMembers.length > 0 && (
                                            <tr className="family-detail-row">
                                                <td colSpan="7">
                                                    <div className="family-detail-container">
                                                        <h4 className="family-detail-title">
                                                            <Users size={16} /> Acompanhantes de {item.name}
                                                        </h4>
                                                        <div className="family-detail-grid">
                                                            {item.familyMembers.map((member, mIdx) => (
                                                                <div className="family-detail-card" key={mIdx}>
                                                                    <span className="family-detail-number">{mIdx + 1}</span>
                                                                    <div className="family-detail-info">
                                                                        <span className="family-detail-name">{member.name}</span>
                                                                        <span className="family-detail-rel">{member.relationship}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">Nenhuma confirmação ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        {notification && (
            <div className={`toast-notification ${notification.type}`}>
                {notification.message}
            </div>
        )}
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

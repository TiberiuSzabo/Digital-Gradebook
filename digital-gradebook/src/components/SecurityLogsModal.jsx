import React, { useEffect, useState } from 'react';

const SecurityLogsModal = ({ isOpen, onClose }) => {
    const [suspiciousUsers, setSuspiciousUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('suspicious');

    useEffect(() => {
        if (!isOpen) return;

        const API_BASE_URL = `https://${window.location.hostname}:5242`;

        fetch(`${API_BASE_URL}/api/Audit/suspicious`)
            .then(res => res.json())
            .then(data => setSuspiciousUsers(data))
            .catch(err => console.error(err));

        fetch(`${API_BASE_URL}/api/Audit/logs`)
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0, color: '#dc3545' }}>🚨 Panou de Securitate</h2>
                    <button onClick={onClose} style={styles.closeBtn}>X</button>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={activeTab === 'suspicious' ? styles.activeTabBtn : styles.tabBtn}
                        onClick={() => setActiveTab('suspicious')}
                    >
                        Lista de Observație (Hackeri)
                    </button>
                    <button
                        style={activeTab === 'logs' ? styles.activeTabBtn : styles.tabBtn}
                        onClick={() => setActiveTab('logs')}
                    >
                        Jurnal Complet (Logs)
                    </button>
                </div>

                <div style={styles.contentArea}>
                    {activeTab === 'suspicious' && (
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>Username</th>
                                <th style={styles.th}>Rol</th>
                                <th style={styles.th}>Motiv</th>
                                <th style={styles.th}>Data Detectării</th>
                            </tr>
                            </thead>
                            <tbody>
                            {suspiciousUsers.map((u, i) => (
                                <tr key={i} style={{ backgroundColor: '#fff3f3' }}>
                                    <td style={styles.td}><strong>{u.username}</strong></td>
                                    <td style={styles.td}>{u.role}</td>
                                    <td style={styles.td}>{u.reason}</td>
                                    <td style={styles.td}>{new Date(u.detectedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {suspiciousUsers.length === 0 && (
                                <tr><td colSpan="4" style={{textAlign: 'center', padding: '10px'}}>Niciun suspect detectat încă.</td></tr>
                            )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'logs' && (
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            {logs.map((l, i) => (
                                <li key={i} style={styles.logItem}>
                                    <span style={{color: '#666'}}>[{new Date(l.timestamp).toLocaleString()}]</span>
                                    <strong> {l.userId}:{l.role} </strong>
                                    - {l.actionInformation}
                                </li>
                            ))}
                            {logs.length === 0 && <p style={{textAlign: 'center'}}>Jurnalul este gol.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { width: '800px', maxHeight: '80vh', backgroundColor: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #ccc' },
    closeBtn: { background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' },
    tabs: {
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#f3f6f9',
        borderBottom: '1px solid #e3e7ea',
        alignItems: 'center'
    },
    tabBtn: {
        flex: '1 1 auto',
        padding: '10px 12px',
        border: '1px solid #d0d7de',
        backgroundColor: '#ffffff',
        color: '#222',
        cursor: 'pointer',
        fontSize: '15px',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 80ms ease'
    },
    activeTabBtn: {
        flex: '1 1 auto',
        padding: '10px 12px',
        border: '1px solid rgba(220,53,69,0.9)',
        backgroundColor: '#dc3545',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '15px',
        borderRadius: '6px',
        fontWeight: '600',
        boxShadow: '0 4px 10px rgba(220,53,69,0.12)',
        transform: 'translateY(-1px)'
    },
    contentArea: { padding: '20px', overflowY: 'auto', flex: 1 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { borderBottom: '2px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#f1f1f1' },
    td: { borderBottom: '1px solid #eee', padding: '8px' },
    logItem: { padding: '8px', borderBottom: '1px solid #eee', fontSize: '14px', fontFamily: 'monospace' }
};

export default SecurityLogsModal;
import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const ChatModal = ({ isOpen, onClose, roomIdentifier, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [visibility, setVisibility] = useState("All");
    const [connection, setConnection] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isOpen || !roomIdentifier) return;

        let isMounted = true;
        let currentConnection = null;
        const API_BASE_URL = "https://digital-gradebook.onrender.com";
        const token = (() => {
            try { return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token; }
            catch { return null; }
        })();

        const startChat = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Chat/${roomIdentifier}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (response.ok) {
                    const history = await response.json();
                    if (isMounted) setMessages(history);
                }
            } catch (error) {
                console.error('Chat history error:', error);
            }

            currentConnection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_BASE_URL}/chatHub`, {
                    accessTokenFactory: () => token
                })
                .withAutomaticReconnect()
                .build();

            try {
                await currentConnection.start();
                await currentConnection.invoke("JoinRoom", roomIdentifier);

                currentConnection.on("ReceiveMessage", (message) => {
                    if (isMounted) {
                        setMessages(prev => [...prev, message]);
                    }
                });

                if (isMounted) setConnection(currentConnection);
            } catch (e) {
                console.error('SignalR connection error:', e);
            }
        };

        startChat();

        return () => {
            isMounted = false;
            if (currentConnection) {
                currentConnection.stop();
                setConnection(null);
            }
        };
    }, [isOpen, roomIdentifier]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !connection) return;

        const senderRole = currentUser?.role || "Unknown";
        const senderName = `${senderRole} (${currentUser?.username})`;
        let msgVisibility = "All";

        if (currentUser?.role === 'Teacher') {
            msgVisibility = visibility;
        } else if (currentUser?.role === 'Parent') {
            msgVisibility = "Parent";
        } else if (currentUser?.role === 'Student') {
            msgVisibility = "Student";
        }

        try {
            await connection.invoke("SendMessage", roomIdentifier, senderName, newMessage, msgVisibility);
            setNewMessage("");
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    const visibleMessages = messages.filter(msg => {
        const userRole = (currentUser?.role || "").toLowerCase();
        const msgVis = (msg.visibility || "All").toLowerCase();

        if (userRole === 'teacher') return true;
        if (userRole === 'parent' && (msgVis === 'all' || msgVis === 'parent')) return true;
        if (userRole === 'student' && (msgVis === 'all' || msgVis === 'student')) return true;

        return false;
    });

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>Discuții: {roomIdentifier}</h3>
                    <button onClick={onClose} style={styles.closeBtn}>X</button>
                </div>

                <div style={styles.chatBox}>
                    {!roomIdentifier && <p style={{color: 'red', textAlign: 'center'}}>Eroare: Email lipsă!</p>}

                    {visibleMessages.length === 0 && roomIdentifier ? (
                        <p style={{textAlign: 'center', color: '#888'}}>Niciun mesaj disponibil.</p>
                    ) : (
                        visibleMessages.map((msg, idx) => (
                            <div key={idx} style={msg.senderName.includes(currentUser?.username) ? styles.myMessage : styles.otherMessage}>
                                <div style={{fontSize: '11px', color: '#555', marginBottom: '2px'}}>
                                    <strong>{msg.senderName}</strong>
                                    {msg.visibility && msg.visibility !== 'All' && <span style={{color: 'red'}}> (Privat: {msg.visibility})</span>}
                                </div>
                                <span>{msg.text}</span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputArea}>
                    {currentUser?.role === 'Teacher' && (
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            style={styles.select}
                        >
                            <option value="All">Către: Toți</option>
                            <option value="Parent">Către: Doar Părinți</option>
                            <option value="Student">Către: Doar Elev</option>
                        </select>
                    )}

                    <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Write a message..."
                            style={styles.input}
                            disabled={!connection}
                        />
                        <button onClick={sendMessage} style={styles.sendBtn} disabled={!connection}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { width: '450px', backgroundColor: 'white', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px' },
    closeBtn: { background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', fontWeight: 'bold' },
    chatBox: { height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: '#f4f6f8', borderRadius: '5px' },
    myMessage: { alignSelf: 'flex-end', backgroundColor: '#d1e7dd', padding: '8px 12px', borderRadius: '8px', maxWidth: '80%', border: '1px solid #badbcc' },
    otherMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '8px', maxWidth: '80%', border: '1px solid #ccc' },
    inputArea: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    select: {
        padding: '8px 10px',
        borderRadius: '6px',
        border: '1px solid #94a3b8',
        fontSize: '13px',
        backgroundColor: '#0d6efd',
        color: '#ffffff',
        boxShadow: '0 1px 4px rgba(13,110,253,0.25)',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none'
    },
    sendBtn: { padding: '8px 15px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ChatModal;
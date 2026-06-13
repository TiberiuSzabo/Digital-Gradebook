import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';

const ROLES = ['Teacher', 'Student', 'Parent', 'Admin'];

const GRADE_COLOR = { FB: '#2d6a4f', B: '#4a90d9', S: '#e67e22', I: '#c0392b' };

const card = {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    padding: '20px 22px',
};

const btnYellow = {
    padding: '5px 12px', backgroundColor: '#ffda47', color: '#333',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12,
};

const btnSaveRole = {
    padding: '5px 12px', backgroundColor: '#52b788', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12,
};

const btnRed = {
    padding: '5px 12px', backgroundColor: '#ff4d4d', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12,
};

const btnGreen = {
    padding: '8px 22px', backgroundColor: '#2d6a4f', color: '#fff',
    border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
};

const inputStyle = {
    padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc',
    fontSize: 14, width: '100%', boxSizing: 'border-box',
};

const selectStyle = {
    padding: '5px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13,
};

// ── Tab: Users ──────────────────────────────────────────────────────────────
function UsersTab() {
    const users        = useAdminStore(s => s.users);
    const fetchUsers   = useAdminStore(s => s.fetchUsers);
    const deleteUser   = useAdminStore(s => s.deleteUser);
    const changeRole   = useAdminStore(s => s.changeRole);
    const resetPassword = useAdminStore(s => s.resetPassword);

    const [pendingRoles, setPendingRoles] = useState({});

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = (uid, role) =>
        setPendingRoles(prev => ({ ...prev, [uid]: role }));

    const handleSaveRole = async (uid) => {
        const role = pendingRoles[uid];
        if (!role) return;
        await changeRole(uid, role);
        setPendingRoles(prev => { const n = { ...prev }; delete n[uid]; return n; });
    };

    const handleResetPassword = async (uid) => {
        const pwd = window.prompt('Enter new password for this user:');
        if (!pwd) return;
        await resetPassword(uid, pwd);
    };

    const handleDelete = async (uid) => {
        if (!window.confirm('Delete this user permanently?')) return;
        await deleteUser(uid);
    };

    return (
        <div style={card}>
            <h3 style={{ margin: '0 0 14px', color: '#1b4332' }}>All Users</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ffe8a3' }}>
                            {['ID', 'Username', 'Role', 'Student ID', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#1b4332', fontWeight: 700 }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr><td colSpan={5} style={{ padding: 20, color: '#aaa', textAlign: 'center' }}>No users found.</td></tr>
                        )}
                        {users.map((u, i) => (
                            <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? '#fffbef' : '#fff', borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '7px 12px', color: '#888' }}>{u.id}</td>
                                <td style={{ padding: '7px 12px', fontWeight: 600 }}>{u.username}</td>
                                <td style={{ padding: '7px 12px' }}>{u.role}</td>
                                <td style={{ padding: '7px 12px', color: '#888' }}>{u.studentId ?? '—'}</td>
                                <td style={{ padding: '7px 12px' }}>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <select
                                            value={pendingRoles[u.id] ?? u.role}
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            style={selectStyle}
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <button
                                            onClick={() => handleSaveRole(u.id)}
                                            disabled={!pendingRoles[u.id]}
                                            style={{
                                                ...btnSaveRole,
                                                opacity: pendingRoles[u.id] ? 1 : 0.4,
                                                cursor: pendingRoles[u.id] ? 'pointer' : 'default',
                                            }}
                                        >
                                            Save Role
                                        </button>
                                        <button onClick={() => handleResetPassword(u.id)} style={btnYellow}>
                                            Reset Password
                                        </button>
                                        <button onClick={() => handleDelete(u.id)} style={btnRed}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Tab: Create Account ──────────────────────────────────────────────────────
function CreateAccountTab() {
    const createUser = useAdminStore(s => s.createUser);

    const [form, setForm] = useState({ username: '', password: '', role: 'Student', studentId: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        const payload = {
            username: form.username,
            password: form.password,
            role: form.role,
            ...(form.studentId ? { studentId: Number(form.studentId) } : {}),
        };
        const ok = await createUser(payload);
        setLoading(false);
        if (ok) {
            setStatus({ type: 'success', msg: 'Account created successfully.' });
            setForm({ username: '', password: '', role: 'Student', studentId: '' });
        } else {
            setStatus({ type: 'error', msg: 'Failed to create account. Check the fields and try again.' });
        }
    };

    return (
        <div style={{ ...card, maxWidth: 440 }}>
            <h3 style={{ margin: '0 0 18px', color: '#1b4332' }}>Create New Account</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Username</label>
                    <input
                        required
                        value={form.username}
                        onChange={e => set('username', e.target.value)}
                        placeholder="Enter username"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Password</label>
                    <input
                        required
                        type="password"
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        placeholder="Enter password"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Role</label>
                    <select
                        value={form.role}
                        onChange={e => set('role', e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>
                        Student ID <span style={{ color: '#aaa' }}>(optional)</span>
                    </label>
                    <input
                        type="number"
                        value={form.studentId}
                        onChange={e => set('studentId', e.target.value)}
                        placeholder="Leave blank if not applicable"
                        style={inputStyle}
                        min={1}
                    />
                </div>
                {status && (
                    <div style={{
                        padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        backgroundColor: status.type === 'success' ? '#dfffd6' : '#fff0f0',
                        color: status.type === 'success' ? '#1b4332' : '#c0392b',
                    }}>
                        {status.msg}
                    </div>
                )}
                <button type="submit" disabled={loading} style={{ ...btnGreen, opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Creating…' : 'Create Account'}
                </button>
            </form>
        </div>
    );
}

// ── Tab: Logs ────────────────────────────────────────────────────────────────
function LogsTab() {
    const logs      = useAdminStore(s => s.logs);
    const fetchLogs = useAdminStore(s => s.fetchLogs);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchLogs();
        setLoading(false);
    };

    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);

    const formatTs = (ts) => {
        try { return new Date(ts).toLocaleString(); } catch { return ts; }
    };

    return (
        <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, color: '#1b4332' }}>Audit Logs <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>(last 100)</span></h3>
                <button onClick={handleRefresh} disabled={loading} style={{ ...btnYellow, opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Loading…' : '🔄 Refresh'}
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ffda47' }}>
                            {['Timestamp', 'User ID', 'Role', 'Action'].map(h => (
                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#1b4332', fontWeight: 700 }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 && (
                            <tr><td colSpan={4} style={{ padding: 20, color: '#aaa', textAlign: 'center' }}>No logs available.</td></tr>
                        )}
                        {sorted.map((log, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '7px 12px', color: '#888', whiteSpace: 'nowrap' }}>{formatTs(log.timestamp)}</td>
                                <td style={{ padding: '7px 12px' }}>{log.userId}</td>
                                <td style={{ padding: '7px 12px' }}>{log.role}</td>
                                <td style={{ padding: '7px 12px', maxWidth: 400, wordBreak: 'break-word' }}>{log.actionInformation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Tab: Teachers ────────────────────────────────────────────────────────────
function TeachersTab() {
    const teacherProfiles      = useAdminStore(s => s.teacherProfiles);
    const fetchTeacherProfiles = useAdminStore(s => s.fetchTeacherProfiles);
    const createTeacherProfile = useAdminStore(s => s.createTeacherProfile);
    const users                = useAdminStore(s => s.users);
    const fetchUsers           = useAdminStore(s => s.fetchUsers);

    const [selectedUserId, setSelectedUserId] = useState('');
    const [subject, setSubject] = useState('');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchTeacherProfiles();
        fetchUsers();
    }, []);

    const teacherUsers = users.filter(u => u.role === 'Teacher');

    const handleSave = async () => {
        if (!selectedUserId || !subject.trim()) return;
        setSaving(true);
        setStatus(null);
        const ok = await createTeacherProfile(Number(selectedUserId), subject.trim());
        setSaving(false);
        if (ok) {
            setStatus({ type: 'success', msg: 'Teacher profile saved.' });
            setSubject('');
            setSelectedUserId('');
        } else {
            setStatus({ type: 'error', msg: 'Failed to save. Try again.' });
        }
    };

    return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Existing profiles */}
            <div style={{ ...card, flex: 1, minWidth: 260 }}>
                <h3 style={{ margin: '0 0 14px', color: '#1b4332' }}>Teacher Profiles</h3>
                {teacherProfiles.length === 0 ? (
                    <p style={{ color: '#aaa', fontSize: 13 }}>No profiles yet.</p>
                ) : (
                    teacherProfiles.map((t, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', marginBottom: 6,
                            backgroundColor: '#dfffd6', borderRadius: 9,
                        }}>
                            <span style={{ fontSize: 20 }}>👩‍🏫</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#1b4332' }}>
                                    {t.userName || t.name || `User ${t.userId}`}
                                </div>
                                {t.subject && (
                                    <div style={{ fontSize: 12, color: '#555' }}>{t.subject}</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Assign subject form */}
            <div style={{ ...card, width: 320 }}>
                <h3 style={{ margin: '0 0 16px', color: '#1b4332' }}>Assign Subject to Teacher</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Teacher</label>
                        <select
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            <option value="">— Select teacher —</option>
                            {teacherUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Subject</label>
                        <input
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. Mathematics"
                            style={inputStyle}
                        />
                    </div>
                    {status && (
                        <div style={{
                            padding: '8px 12px', borderRadius: 8, fontSize: 13,
                            backgroundColor: status.type === 'success' ? '#dfffd6' : '#fff0f0',
                            color: status.type === 'success' ? '#1b4332' : '#c0392b',
                        }}>
                            {status.msg}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedUserId || !subject.trim()}
                        style={{
                            ...btnGreen,
                            opacity: (saving || !selectedUserId || !subject.trim()) ? 0.5 : 1,
                            cursor: (saving || !selectedUserId || !subject.trim()) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main AdminView ────────────────────────────────────────────────────────────
const TABS = ['Users', 'Create Account', 'Logs', 'Teachers'];

function AdminView({ themeStyles }) {
    const [activeTab, setActiveTab] = useState('Users');

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h2 style={{ margin: '0 0 16px', color: '#1b4332' }}>Admin Panel</h2>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #dfffd6' }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '9px 20px',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? 700 : 500,
                            fontSize: 14,
                            backgroundColor: activeTab === tab ? '#dfffd6' : '#f0f0f0',
                            color: activeTab === tab ? '#1b4332' : '#666',
                            borderBottom: activeTab === tab ? '2px solid #2d6a4f' : '2px solid transparent',
                            marginBottom: -2,
                            transition: 'background-color 0.15s',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Users'          && <UsersTab />}
            {activeTab === 'Create Account' && <CreateAccountTab />}
            {activeTab === 'Logs'           && <LogsTab />}
            {activeTab === 'Teachers'       && <TeachersTab />}
        </div>
    );
}

export default AdminView;

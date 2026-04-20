// src/components/DetailedView.jsx
import React from 'react';

function DetailedView({ student, onBack, onEdit, onDelete }) {
    if (!student) return null;

    const getEmoji = (grade) => {
        if (grade === 'FB' || grade === 'B') return '😊';
        if (grade === 'S') return '⚠️';
        if (grade === 'I') return '🔺';
        return '😊';
    };

    const recentGrades = [student.grade, 'FB', 'B'];

    return (
        <div className="detail-container">
            <div className="detail-back-btn" onClick={onBack}>
                <span className="detail-back-icon">←</span> Back to MasterView
            </div>

            <div className="detail-card">
                <div className="detail-header">
                    <span>Student Details</span>
                    <span className="detail-close-btn" onClick={onBack}>X</span>
                </div>

                <div className="detail-body">
                    <div className="detail-left">
                        <div className="detail-pic">
                            A pic<br/>with the angel
                        </div>
                        <h2 className="detail-name">{student.lastName} {student.firstName}</h2>
                        <div className="detail-subtitle">Student · 3rd Year</div>
                        <div className="detail-year">(2025/2026)</div>
                        <div className="detail-emoji-box">
                            <span className="detail-emoji">
                                {getEmoji(student.grade)}
                            </span>
                        </div>
                    </div>

                    <div className="detail-right">
                        <div className="detail-info-box">
                            <div className="detail-info-row">
                                <div><div className="detail-label">Birth Date</div><div className="detail-value">{student.birthDate}</div></div>
                                <div><div className="detail-label">Email</div><div className="detail-value">{student.email}</div></div>
                                <div><div className="detail-label">CNP</div><div className="detail-value">{student.cnp}</div></div>
                            </div>
                            <div className="detail-info-row-center">
                                <div><div className="detail-label">Username</div><div className="detail-value">{student.username}</div></div>
                                <div><div className="detail-label">Unique Number</div><div className="detail-value">{student.uniqueNumber}</div></div>
                            </div>
                            <div className="detail-actions">
                                <button className="detail-btn-msg">Send a message</button>
                                <button className="detail-btn-edit" onClick={onEdit}>Edit</button>
                                <button className="detail-btn-delete" onClick={onDelete}>Delete</button>
                            </div>
                        </div>

                        <div className="detail-parents-box">
                            <div className="detail-parents-header">
                                <span>Parents</span><span>Phone number</span>
                            </div>
                            <div className="detail-parent-row">
                                <div className="detail-parent-name"><div className="detail-dot"></div>{student.parentDad || '-'} (Dad)</div>
                                <div>{student.phoneDad || 'Nu este setat'}</div>
                            </div>
                            <div className="detail-parent-row">
                                <div className="detail-parent-name"><div className="detail-dot"></div>{student.parentMom || '-'} (Mom)</div>
                                <div>{student.phoneMom || 'Nu este setat'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-footer">
                    <div className="detail-footer-left">
                        <div className="detail-label detail-footer-label">Click here to<br/>see/add/update grades</div>
                        <div className="detail-value detail-footer-value">Note recente: <strong>{recentGrades.join(', ')}</strong></div>
                    </div>
                    <div className="detail-footer-right">
                        <span><span className="detail-mention-label">Mentions:</span> {student.mentions}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailedView;
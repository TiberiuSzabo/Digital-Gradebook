// src/components/StudentForm.jsx
import React from 'react';
import { useStudentForm } from '../hooks/useStudentForm'; // Importăm logica separată

function StudentForm({ initialData, onSave, onCancel }) {
    const { formData, handleChange, handleSubmit } = useStudentForm(initialData, onSave);

    return (
        <div className="form-container">
            <h2 className="form-title">{initialData ? 'Edit Student' : 'Add New Student'}</h2>

            <form onSubmit={handleSubmit} className="form-layout">
                <div className="form-row">
                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="form-input" />
                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="form-input" />
                </div>

                <div className="form-row">
                    <input name="grade" value={formData.grade} onChange={handleChange} placeholder="Grade (FB, B, S, I)" className="form-input" />
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="form-input" />
                </div>

                <div className="form-row">
                    <input name="birthDate" value={formData.birthDate} onChange={handleChange} placeholder="Birth Date (DD/MM/YYYY)" className="form-input" />
                    <input name="cnp" value={formData.cnp} onChange={handleChange} placeholder="CNP" className="form-input" />
                </div>

                <div className="form-row">
                    <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="form-input" />
                    <input name="uniqueNumber" value={formData.uniqueNumber} onChange={handleChange} placeholder="Unique Number" className="form-input" />
                </div>

                <hr className="form-divider" />

                <div className="form-row">
                    <input name="parentDad" value={formData.parentDad} onChange={handleChange} placeholder="Father's Name" className="form-input" />
                    <input name="phoneDad" value={formData.phoneDad} onChange={handleChange} placeholder="Father's Phone" className="form-input" />
                </div>
                <div className="form-row">
                    <input name="parentMom" value={formData.parentMom} onChange={handleChange} placeholder="Mother's Name" className="form-input" />
                    <input name="phoneMom" value={formData.phoneMom} onChange={handleChange} placeholder="Mother's Phone" className="form-input" />
                </div>

                <textarea
                    name="mentions"
                    value={formData.mentions}
                    onChange={handleChange}
                    placeholder="Mentions (ex: Very active in class...)"
                    className="form-input form-textarea"
                />

                <div className="form-row" style={{ marginTop: '10px' }}>
                    <button type="button" onClick={onCancel} className="form-btn-cancel">Cancel</button>
                    <button type="submit" className="form-btn-save">Save Student</button>
                </div>
            </form>
        </div>
    );
}

export default StudentForm;
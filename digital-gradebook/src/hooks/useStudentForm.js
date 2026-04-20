// src/hooks/useStudentForm.js
import { useState } from 'react';

export function useStudentForm(initialData, onSave) {
    const [formData, setFormData] = useState(initialData || {
        lastName: '', firstName: '', grade: 'FB', email: '', birthDate: '',
        cnp: '', username: '', uniqueNumber: '',
        parentDad: '', phoneDad: '',
        parentMom: '', phoneMom: '',
        mentions: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.lastName || formData.lastName.trim() === '') {
            alert("Numele de familie (Last Name) este obligatoriu!");
            return;
        }
        if (!formData.firstName || formData.firstName.trim() === '') {
            alert("Prenumele (First Name) este obligatoriu!");
            return;
        }

        if (!['FB', 'B', 'S', 'I'].includes(formData.grade)) {
            alert("Nota trebuie să fie FB, B, S sau I.");
            return;
        }

        const emailRegex = /^[^\s@]+@student\.com$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            alert("Email-ul este obligatoriu și trebuie să se termine în '@student.com'!");
            return;
        }

        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
        if (!formData.birthDate || !dateRegex.test(formData.birthDate)) {
            alert("Data nașterii este obligatorie și trebuie să fie în formatul ZZ/LL/AAAA (ex: 29/10/2015).");
            return;
        }

        const cnpRegex = /^\d{13}$/;
        if (!formData.cnp || !cnpRegex.test(formData.cnp)) {
            alert("CNP-ul este obligatoriu și trebuie să conțină exact 13 cifre!");
            return;
        }

        if (!formData.username || formData.username.trim() === '') {
            alert("Username-ul este obligatoriu!");
            return;
        }
        if (!formData.uniqueNumber || formData.uniqueNumber.trim() === '') {
            alert("Numărul unic (Unique Number) este obligatoriu!");
            return;
        }

        if (!formData.parentDad || formData.parentDad.trim() === '') {
            alert("Numele tatălui (Father's Name) este obligatoriu!");
            return;
        }
        const phoneRegex = /^07\d{8}$/;
        if (!formData.phoneDad || !phoneRegex.test(formData.phoneDad)) {
            alert("Numărul de telefon al tatălui este obligatoriu, trebuie să înceapă cu '07' și să aibă exact 10 cifre!");
            return;
        }

        if (!formData.parentMom || formData.parentMom.trim() === '') {
            alert("Numele mamei (Mother's Name) este obligatoriu!");
            return;
        }
        if (!formData.phoneMom || !phoneRegex.test(formData.phoneMom)) {
            alert("Numărul de telefon al mamei este obligatoriu, trebuie să înceapă cu '07' și să aibă exact 10 cifre!");
            return;
        }


        onSave(formData);
    };

    return { formData, handleChange, handleSubmit };
}
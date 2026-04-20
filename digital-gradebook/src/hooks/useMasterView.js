// src/hooks/useMasterView.js
import { useState } from 'react';

export function useMasterView(students) {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('table');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const studentsPerPage = 10;
    const totalPages = Math.ceil(students.length / studentsPerPage) || 1;

    const gradeValues = { 'I': 1, 'S': 2, 'B': 3, 'FB': 4 };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedStudents = [...students].sort((a, b) => {
        if (sortConfig.key === 'name') {
            const nameA = `${a.lastName} ${a.firstName}`;
            const nameB = `${b.lastName} ${b.firstName}`;
            if (nameA < nameB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (nameA > nameB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
        if (sortConfig.key === 'grade') {
            const valA = gradeValues[a.grade];
            const valB = gradeValues[b.grade];
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const getEmoji = (grade) => {
        if (grade === 'FB') return '🌞';
        if (grade === 'B') return '😊';
        if (grade === 'S') return '⚠️';
        if (grade === 'I') return '🔺';
        return '🌞';
    };

    let classAverageStr = "-";
    let classProgressStr = "-";
    let fbDeg = 0, bDeg = 0, sDeg = 0, iDeg = 0;
    let fbCount = 0, bCount = 0, sCount = 0, iCount = 0;

    if (students.length > 0) {
        const reverseGrade = { 1: 'I', 2: 'S', 3: 'B', 4: 'FB' };
        const progressMap = { 'FB': 'High', 'B': 'Good', 'S': 'Bad', 'I': 'Terrible' };

        let totalScore = 0;
        students.forEach(s => {
            totalScore += gradeValues[s.grade] || 0;
        });

        const avgScore = Math.round(totalScore / students.length);
        classAverageStr = reverseGrade[avgScore] || '-';
        classProgressStr = progressMap[classAverageStr] || '-';

        fbCount = students.filter(s => s.grade === 'FB').length;
        bCount = students.filter(s => s.grade === 'B').length;
        sCount = students.filter(s => s.grade === 'S').length;
        iCount = students.filter(s => s.grade === 'I').length;

        fbDeg = (fbCount / students.length) * 360;
        bDeg = (bCount / students.length) * 360;
        sDeg = (sCount / students.length) * 360;
    }

    return {
        currentPage, setCurrentPage, totalPages,
        activeTab, setActiveTab,
        sortConfig, handleSort,
        currentStudents, getEmoji,
        classAverageStr, classProgressStr,
        indexOfFirstStudent, indexOfLastStudent,
        fbDeg, bDeg, sDeg, iDeg,
        fbCount, bCount, sCount, iCount
    };
}
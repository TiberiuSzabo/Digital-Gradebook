import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DetailedView from './DetailedView';

const mockStudent = {
    id: 99,
    lastName: 'Eminescu',
    firstName: 'Mihai',
    grade: 'FB',
    email: 'mihai@poezie.ro',
    birthDate: '15/01/1850',
    cnp: '5000115123456',
    username: 'mihaita',
    uniqueNumber: '99999',
    parentDad: 'Gheorghe',
    phoneDad: '0700111222',
    parentMom: 'Raluca',
    phoneMom: '0700333444',
    mentions: 'Foarte talentat la literatura.'
};

describe('DetailedView Component', () => {

    it('nu randeaza nimic daca nu primeste datele unui elev', () => {
        const { container } = render(<DetailedView student={null} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('afiseaza corect detaliile elevului pe ecran', () => {
        render(<DetailedView student={mockStudent} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Verificăm dacă informațiile esențiale apar pe ecran
        expect(screen.getByText('Eminescu Mihai')).toBeInTheDocument();
        expect(screen.getByText('mihai@poezie.ro')).toBeInTheDocument();
        expect(screen.getByText('5000115123456')).toBeInTheDocument();
        expect(screen.getByText(/Foarte talentat la literatura/i)).toBeInTheDocument();
    });

    it('declanseaza functiile corecte la apasarea butoanelor', () => {
        const mockOnBack = vi.fn();
        const mockOnEdit = vi.fn();
        const mockOnDelete = vi.fn();

        render(<DetailedView student={mockStudent} onBack={mockOnBack} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

        // 1. Testăm butonul de Edit
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalledTimes(1); // Trebuie să fi fost apelat exact o dată

        // 2. Testăm butonul de Delete
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);

        // 3. Testăm butonul de Back (dăm click pe textul "Back to MasterView")
        const backButton = screen.getByText(/Back to MasterView/i);
        fireEvent.click(backButton);
        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
    it('afiseaza corect emoji-urile pentru alte note (S, I)', () => {
        const studentS = { ...mockStudent, grade: 'S' };
        const studentI = { ...mockStudent, grade: 'I' };

        // Render pentru nota S
        const { unmount } = render(<DetailedView student={studentS} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('⚠️')).toBeInTheDocument();
        unmount(); // Curățăm ecranul pentru următorul test

        // Render pentru nota I
        render(<DetailedView student={studentI} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
        expect(screen.getByText('🔺')).toBeInTheDocument();
    });
    it('afiseaza emoji-ul default pentru o nota necunoscuta', () => {
        // Creăm un student cu o notă invalidă/necunoscută pentru a atinge linia de "return '😊';"
        const studentUnknown = { ...mockStudent, grade: 'X' };
        render(<DetailedView student={studentUnknown} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Verificăm dacă nu crapă și pune emoji-ul de fallback
        expect(screen.getAllByText('😊').length).toBeGreaterThan(0);
    });
    it('afiseaza valorile implicite (fallback) cand lipsesc datele parintilor', () => {
        // Creăm un elev care nu are completate numele și telefoanele părinților
        const studentFaraParinti = { ...mockStudent, parentDad: '', phoneDad: '', parentMom: '', phoneMom: '' };
        render(<DetailedView student={studentFaraParinti} onBack={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

        // Ne așteptăm ca textul de siguranță "Nu este setat" să apară de 2 ori pe ecran
        const fallbackTexts = screen.getAllByText('Nu este setat');
        expect(fallbackTexts.length).toBe(2);
    });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MasterView from './MasterView';

// Creăm o listă falsă de elevi pentru test
const mockStudents = [
    { id: 1, lastName: 'A', firstName: 'Alex', grade: 'FB' },
    { id: 2, lastName: 'Z', firstName: 'Zoe', grade: 'S' }
];

describe('MasterView Component', () => {
    it('randeaza corect lista de studenti', () => {
        render(<MasterView students={mockStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Verificăm dacă elevii apar pe ecran
        expect(screen.getByText(/Alex/i)).toBeInTheDocument();
        expect(screen.getByText(/Zoe/i)).toBeInTheDocument();
        expect(screen.getByText('Showing 1-2 of 2 students.')).toBeInTheDocument();
    });

    it('schimba directia de sortare la click pe capul de tabel', () => {
        render(<MasterView students={mockStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        const nameHeader = screen.getByText(/Name/i);

        // Primul click activează sortarea pe "Name" în mod crescător
        fireEvent.click(nameHeader);
        // Verificăm dacă apare săgeata în sus
        expect(nameHeader.textContent).toContain('↑');

        // Al doilea click pe aceeași coloană inversează sortarea (descrescător)
        fireEvent.click(nameHeader);
        // Acum verificăm dacă a apărut săgeata în jos
        expect(nameHeader.textContent).toContain('↓');
    });
    it('poate sorta lista dupa nota (Final Grade)', () => {
        render(<MasterView students={mockStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);
        const gradeHeader = screen.getByText(/Final Grade/i);

        // Click pentru a sorta după notă
        fireEvent.click(gradeHeader);
        expect(gradeHeader.textContent).toContain('↑');
    });

    it('schimba afisarea pe tab-ul Statistics si randeaza graficul', () => {
        render(<MasterView students={mockStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Dăm click pe tab-ul Statistics
        const statsTab = screen.getByText('Statistics');
        fireEvent.click(statsTab);

        // Verificăm dacă a apărut titlul graficului din Statistics
        expect(screen.getByText('Class Grades')).toBeInTheDocument();
        // Verificăm dacă a apărut butonul specific "Class Weather"
        expect(screen.getByText('Class Weather')).toBeInTheDocument();
    });
    it('acopera cazurile de egalitate la sortare si fallback la note', () => {
        // Creăm studenți cu nume și note IDENTICE pentru a atinge liniile cu "return 0;" din sortare
        // Adăugăm și o notă necunoscută ca să atingem fallback-ul de emoji din tabel
        const equalStudents = [
            { id: 1, lastName: 'Pop', firstName: 'Ion', grade: 'FB' },
            { id: 2, lastName: 'Pop', firstName: 'Ion', grade: 'FB' },
            { id: 3, lastName: 'Z', firstName: 'A', grade: 'UNKNOWN' }
        ];
        render(<MasterView students={equalStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Dăm click să sortăm după nume (va atinge egalitatea)
        fireEvent.click(screen.getByText(/Name/i));
        // Dăm click să sortăm după notă (va atinge egalitatea)
        fireEvent.click(screen.getByText(/Final Grade/i));

        // Verificăm că tabelul nu a crăpat
        expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    });

    it('randeaza corect tabelul cand lista de studenti este goala', () => {
        // Simulam stergerea tuturor elevilor
        render(<MasterView students={[]} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Verificam textul de empty state
        expect(screen.getByText('No students found.')).toBeInTheDocument();
        // Verificam mediile care ar trebui sa devina "-"
        expect(screen.getByText('Class Average: -')).toBeInTheDocument();
    });

    it('randeaza corect podiumul in Statistics cand exista mai putin de 3 studenti', () => {
        // Un singur elev în clasă va lăsa locurile II și III goale
        const singleStudent = [{ id: 1, lastName: 'Singur', firstName: 'Ion', grade: 'FB' }];
        render(<MasterView students={singleStudent} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Trecem pe tabul de statistici
        fireEvent.click(screen.getByText('Statistics'));

        // Elevul nostru ar trebui să fie pe primul loc
        expect(screen.getByText('Singur Ion')).toBeInTheDocument();
    });
    it('calculeaza corect mediile si pune fallback (-) daca o nota e corupta', () => {
        // Dacă din greșeală un elev are nota 'NOTA_GRESITA', testăm dacă aplicația se protejează cu '-'
        const invalidGradeStudent = [{ id: 1, lastName: 'Test', firstName: 'Test', grade: 'NOTA_GRESITA' }];
        render(<MasterView students={invalidGradeStudent} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Media clasei și progresul trebuie să fie protejate și să afișeze '-'
        expect(screen.getByText('Class Average: -')).toBeInTheDocument();
        expect(screen.getByText('Class progress: -')).toBeInTheDocument();
    });

    it('permite navigarea prin paginare (Previous, Next, Page 2)', () => {
        // Generăm o listă mare de 11 elevi falsi ca să se activeze paginația
        const manyStudents = Array.from({ length: 11 }, (_, i) => ({
            id: i, lastName: `Elev${i}`, firstName: 'Test', grade: 'FB'
        }));
        render(<MasterView students={manyStudents} onStudentClick={vi.fn()} onAddClick={vi.fn()} />);

        // Verificăm dacă suntem pe prima pagină
        expect(screen.getByText('Showing 1-10 of 11 students.')).toBeInTheDocument();

        // Dăm click pe pagina 2
        fireEvent.click(screen.getByText('2'));
        expect(screen.getByText('Showing 11-11 of 11 students.')).toBeInTheDocument();

        // Dăm click înapoi (Previous)
        fireEvent.click(screen.getByText('< Previous'));
        expect(screen.getByText('Showing 1-10 of 11 students.')).toBeInTheDocument();

        // Dăm click pe Next
        fireEvent.click(screen.getByText('Next >'));
        expect(screen.getByText('Showing 11-11 of 11 students.')).toBeInTheDocument();
    });
});
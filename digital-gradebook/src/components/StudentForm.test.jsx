import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudentForm from './StudentForm';

describe('StudentForm Component - Validari Complete', () => {
    it('trece prin absolut toate validarile pas cu pas pana la salvare', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockOnSave = vi.fn();
        const { container } = render(<StudentForm onSave={mockOnSave} onCancel={vi.fn()} />);
        const saveBtn = screen.getByText('Save Student');

        // 1. Apăsăm Save fără să completăm nimic -> Pică la Last Name
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numele de familie (Last Name) este obligatoriu!");
        alertMock.mockClear();

        // 2. Completăm Last Name -> Pică la First Name
        fireEvent.change(container.querySelector('[name="lastName"]'), { target: { name: 'lastName', value: 'Popescu' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Prenumele (First Name) este obligatoriu!");
        alertMock.mockClear();

        // 3. Completăm First Name, dar punem Nota gresita -> Pică la Notă
        fireEvent.change(container.querySelector('[name="firstName"]'), { target: { name: 'firstName', value: 'Ion' } });
        fireEvent.change(container.querySelector('[name="grade"]'), { target: { name: 'grade', value: 'X' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Nota trebuie să fie FB, B, S sau I.");
        alertMock.mockClear();

        // 4. Punem Nota corecta (FB) -> Pică la Email
        fireEvent.change(container.querySelector('[name="grade"]'), { target: { name: 'grade', value: 'FB' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Email-ul este obligatoriu și trebuie să se termine în '@student.com'!");
        alertMock.mockClear();

        // 5. Completăm Email -> Pică la Data Nașterii
        fireEvent.change(container.querySelector('[name="email"]'), { target: { name: 'email', value: 'ion@student.com' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Data nașterii este obligatorie și trebuie să fie în formatul ZZ/LL/AAAA (ex: 29/10/2015).");
        alertMock.mockClear();

        // 6. Completăm Data -> Pică la CNP
        fireEvent.change(container.querySelector('[name="birthDate"]'), { target: { name: 'birthDate', value: '15/05/2010' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("CNP-ul este obligatoriu și trebuie să conțină exact 13 cifre!");
        alertMock.mockClear();

        // 7. Completăm CNP -> Pică la Username
        fireEvent.change(container.querySelector('[name="cnp"]'), { target: { name: 'cnp', value: '5100515123456' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Username-ul este obligatoriu!");
        alertMock.mockClear();

        // 8. Completăm Username -> Pică la Unique Number
        fireEvent.change(container.querySelector('[name="username"]'), { target: { name: 'username', value: 'ionpopescu' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numărul unic (Unique Number) este obligatoriu!");
        alertMock.mockClear();

        // 9. Completăm Unique Number -> Pică la Nume Tata
        fireEvent.change(container.querySelector('[name="uniqueNumber"]'), { target: { name: 'uniqueNumber', value: '12345' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numele tatălui (Father's Name) este obligatoriu!");
        alertMock.mockClear();

        // 10. Completăm Nume Tata -> Pică la Telefon Tata
        fireEvent.change(container.querySelector('[name="parentDad"]'), { target: { name: 'parentDad', value: 'Vasile' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numărul de telefon al tatălui este obligatoriu, trebuie să înceapă cu '07' și să aibă exact 10 cifre!");
        alertMock.mockClear();

        // 11. Completăm Telefon Tata -> Pică la Nume Mama
        fireEvent.change(container.querySelector('[name="phoneDad"]'), { target: { name: 'phoneDad', value: '0712345678' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numele mamei (Mother's Name) este obligatoriu!");
        alertMock.mockClear();

        // 12. Completăm Nume Mama -> Pică la Telefon Mama
        fireEvent.change(container.querySelector('[name="parentMom"]'), { target: { name: 'parentMom', value: 'Maria' } });
        fireEvent.click(saveBtn);
        expect(alertMock).toHaveBeenCalledWith("Numărul de telefon al mamei este obligatoriu, trebuie să înceapă cu '07' și să aibă exact 10 cifre!");
        alertMock.mockClear();

        // 13. Completăm Telefon Mama -> ACUM TOTUL E PERFECT, TREBUIE SĂ SALVEZE!
        fireEvent.change(container.querySelector('[name="phoneMom"]'), { target: { name: 'phoneMom', value: '0787654321' } });
        fireEvent.click(saveBtn);

        // Verificăm dacă funcția de salvare a fost apelată o singură dată la final
        expect(mockOnSave).toHaveBeenCalledTimes(1);

        alertMock.mockRestore();
    });
});
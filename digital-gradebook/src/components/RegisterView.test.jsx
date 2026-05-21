import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterView from './RegisterView';

// Mock pentru store-ul de Auth
vi.mock('../store/useAuthStore', () => ({
    useAuthStore: () => ({
        register: vi.fn().mockReturnValue({ success: false, message: 'Eroare simulata' })
    })
}));

describe('RegisterView Component - Frontend Tests', () => {
    it('arunca eroare daca parolele nu se potrivesc', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const { container } = render(<BrowserRouter><RegisterView /></BrowserRouter>);

        fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'ParolaMea123!' } });
        fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'AltaParolaGresita!' } });

        fireEvent.click(screen.getByText('Create account'));
        expect(alertMock).toHaveBeenCalledWith("Parolele nu se potrivesc!");
        alertMock.mockRestore();
    });

    it('verifica obligativitatea domeniului @teacher.com pentru profesori', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const { container } = render(<BrowserRouter><RegisterView /></BrowserRouter>);

        // Completăm corect parola ca să treacă de prima validare
        fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'ParolaMea123!' } });
        fireEvent.change(container.querySelector('input[name="confirmPassword"]'), { target: { value: 'ParolaMea123!' } });

        // Punem un email greșit pentru rolul de Teacher (rolul implicit)
        fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'profesor@gmail.com' } });

        fireEvent.click(screen.getByText('Create account'));
        expect(alertMock).toHaveBeenCalledWith("Eroare: Profesorii trebuie să folosească o adresă de email de tipul @teacher.com!");
        alertMock.mockRestore();
    });
});
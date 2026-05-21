import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LogInView from './LogInView';

// Simulăm backend-ul (ca să nu dea eroare dacă serverul C# e oprit in timpul testelor)
vi.mock('../store/useAuthStore', () => ({
    useAuthStore: () => ({
        login: vi.fn().mockResolvedValue({ success: false, message: 'Email sau parola incorecta!' }),
        verify2FA: vi.fn(),
        verifyPin: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn()
    })
}));

describe('LogInView Component - Frontend Tests', () => {
    it('randeaza corect inputurile pentru email si parola', () => {
        render(<BrowserRouter><LogInView /></BrowserRouter>);
        expect(screen.getByPlaceholderText('yourName@dgb.ro')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
    });

    it('blocheaza logarea daca credentialele sunt gresite', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        render(<BrowserRouter><LogInView /></BrowserRouter>);

        fireEvent.click(screen.getByText('Sign In'));

        await new Promise(process.nextTick);
        expect(alertMock).toHaveBeenCalledWith('Email sau parola incorecta!');
        alertMock.mockRestore();
    });
});
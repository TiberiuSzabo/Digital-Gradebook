import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export function useUserTracking() {
    const [theme, setTheme] = useState(Cookies.get('themePreference') || 'light');

    const [lastActivity, setLastActivity] = useState(Cookies.get('lastAction') || 'Nicio activitate recentă');

    useEffect(() => {
        Cookies.set('themePreference', theme, { expires: 30 });

        // Aplicăm tema pe întregul document (vei putea adăuga CSS pentru .dark mai târziu)
        document.body.className = theme;
    }, [theme]);

    // Funcție pentru a schimba tema
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Funcție pentru a înregistra o activitate nouă
    const logActivity = (actionDescription) => {
        Cookies.set('lastAction', actionDescription, { expires: 7 }); // Expiră în 7 zile
        setLastActivity(actionDescription);
    };

    return { theme, toggleTheme, lastActivity, logActivity };
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Am adăugat HttpLink în import
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

// 2. Inițializăm Clientul Apollo corect pentru varianta "core"
export const client = new ApolloClient({
    // Folosim `link` în loc de `uri`
    link: new HttpLink({ uri: 'http://localhost:3000/graphql' }),
    cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
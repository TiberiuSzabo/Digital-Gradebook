import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [
        react(),
        basicSsl() // Asta îți criptează rețeaua cu HTTPS
    ],
    server: {
        host: '0.0.0.0', // Ne lasă să intrăm de pe telefon
        port: 5173
    }
})
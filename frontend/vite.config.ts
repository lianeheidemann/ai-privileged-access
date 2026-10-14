// Configura o Vite para execução local e publicação do frontend no GitHub Pages.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/dataguard-ai/' : '/',
  server: { host: '127.0.0.1', port: 5173 },
})

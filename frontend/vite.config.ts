// Configura o Vite para execução local, testes e publicação do protótipo no GitHub Pages.
/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No GitHub Pages o site fica em /<nome-do-repositório>/; deriva do ambiente da Action para sobreviver a renomeações.
  base: process.env.GITHUB_PAGES === 'true' ? `/${(process.env.GITHUB_REPOSITORY ?? 'lianeheidemann/ai-privileged-access').split('/')[1]}/` : '/',
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    // Recharts (~540 kB) fica em um chunk próprio, carregado só na tela Análises.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-table'],
        },
      },
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: false },
})

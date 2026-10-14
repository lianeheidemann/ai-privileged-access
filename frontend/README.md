# Interface inicial — DataGuard AI

Primeira tela implementada: **Visão geral**, com navegação, alternância de tema e referências estáticas ao dataset sintético. As demais telas são espaços reservados. **Não há backend, autenticação, Ollama nem banco conectado.**

## Executar localmente

Requer Node.js compatível com Vite 6 e npm.

```bash
# Instala as dependências e inicia a interface de demonstração.
cd frontend
npm install
npm run dev
```

Abra http://127.0.0.1:5173. Para gerar uma versão estática, execute `npm run build`.

A interface **não deve ser exposta como aplicação corporativa** antes da implementação de API, controles de acesso e testes de segurança.

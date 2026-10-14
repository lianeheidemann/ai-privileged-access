# Protótipo visual — DataGuard AI

Interface React com as **sete telas planejadas**: Visão geral, Fontes de dados, Consultas, Análises, Assistente, Relatórios e Configurações. Os números exibidos são **agregados reais do dataset sintético** (`data/csv/`), gerados por script. **Não há backend, autenticação, Ollama nem banco conectado.**

## Stack utilizada

| Função | Biblioteca |
| --- | --- |
| Base | React 18 + TypeScript + Vite 6 |
| Estilo e componentes | Tailwind CSS 4 + componentes no padrão shadcn/ui (`src/components/ui/`, `components.json`) + Lucide React |
| Tabelas | TanStack Table (ordenação, busca e paginação) |
| Dados | TanStack Query sobre uma API simulada local (`src/services/demo-api.ts`) |
| Gráficos | Recharts |
| Testes | Vitest + Testing Library |

## Executar

Requer Node.js 20+ e npm.

```bash
# Instala exatamente as versões do lockfile e inicia em 127.0.0.1:5173
cd frontend
npm ci
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm test` | Testes de navegação, tabela, exportação CSV e política do assistente |
| `npm run typecheck` | Verificação de tipos |
| `npm run build` | Build estático em `dist/` |
| `npm run preview` | Serve o build em `127.0.0.1:4173` |

## Estrutura

```text
src/
├── components/
│   ├── ui/            # Primitivas no padrão shadcn/ui (button, card, badge, input, select, table)
│   ├── layout/        # Sidebar, Topbar, cabeçalhos e avisos
│   └── data-table/    # DataTable genérica (TanStack Table)
├── pages/             # As sete telas
├── services/          # API simulada + hooks TanStack Query (mesma forma da futura /api)
├── lib/               # Formatação, preferências, CSV seguro, política do assistente demonstrativo
├── data/              # demo-summary.json, gerado — não editar à mão
├── types/             # Contratos dos dados
└── test/              # Testes Vitest
```

## Dados da demonstração

`src/data/demo-summary.json` é gerado a partir dos CSVs sintéticos:

```bash
python scripts/dataset/gerar_resumo_frontend.py
```

O arquivo inclui todos os 750 equipamentos e amostras dos 200 eventos mais recentes de movimentações e chamados. **O gabarito de anomalias não é incluído.** O JSON entra no build público, portanto **nunca** gere esse arquivo a partir de dados reais. A CI falha se o JSON estiver desatualizado em relação aos CSVs.

## Controles demonstrados

- **Assistente:** bloqueia pedidos de escrita, contorno de regras, segredos, SQL livre e envio externo antes de qualquer consulta. Os números vêm do resumo sintético, sem LLM. Os casos adversariais seguem `data/avaliacao/perguntas_assistente.csv`.
- **Relatórios:** a exportação CSV neutraliza células que começam com `=`, `+`, `-` ou `@` (CSV/formula injection).
- **Sem rede:** os testes verificam que a navegação não chama `fetch`. Não há fontes, scripts ou estilos de CDN.

A interface **não deve ser exposta como aplicação corporativa** antes da API FastAPI, da autorização por papel e dos testes de segurança. Na etapa 03, `src/services/demo-api.ts` será substituído por chamadas `fetch('/api/...')`; as telas não precisarão mudar.

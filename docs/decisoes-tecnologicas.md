# Decisões tecnológicas

> **Última revisão:** 14/10/2026.

Este documento registra **por que** cada tecnologia foi escolhida, quais alternativas foram consideradas e quais riscos permanecem. Ele complementa as tabelas de stack do [README](../README.md) e da [etapa 00](00-arquitetura-e-escopo.md).

**Como ler:** "Situação" indica se a escolha já está em uso no repositório ou é planejada. As versões estão na seção [Versões](#versões). **Fixe versões exatas** (lockfile, hashes) ao implementar e reavalie as escolhas se uma premissa mudar. Informações que **não foram verificadas em fonte oficial** estão marcadas como tal.

## Critérios gerais

1. **Execução 100% local** depois do preparo, sem dependência de serviços externos em runtime.
2. **Superfície de ataque pequena:** poucos serviços, bind em loopback, sem portas de banco.
3. **Testabilidade:** cada controle de segurança precisa de teste automatizado.
4. **Hardware de referência:** notebook Windows 11, 16 GB de RAM, RTX 3060 Laptop com 6 GB de VRAM.
5. **Curva de aprendizado e manutenção** compatíveis com um projeto de estudo individual.
6. **Caminho para a empresa:** a escolha do MVP não pode impedir a etapa 05 (rede privada, outros SGBDs).

## Versões

### Frontend (em uso)

Versões exatas do `frontend/package-lock.json`. O `npm ci` instala exatamente estas.

| Pacote | Versão | Uso |
| --- | --- | --- |
| React / React DOM | 18.3.1 | Interface |
| TypeScript | 5.6.3 | Tipagem (`strict`), verificada por `tsc -b` no build |
| Vite | 6.4.4 | Build e servidor de desenvolvimento |
| Tailwind CSS / `@tailwindcss/vite` | 4.3.3 | Estilo e tokens de tema |
| TanStack Table | 8.21.3 | Tabelas (ordenação, filtro, paginação) |
| TanStack Query | 5.104.2 | Estado de dados e carregamento |
| Recharts | 3.10.1 | Gráficos |
| lucide-react | 0.468.0 | Ícones |
| class-variance-authority, tailwind-merge, `@radix-ui/react-slot` | 0.7.1, 3.7.0, 1.5.0 | Primitivas no padrão shadcn/ui |
| Vitest / Testing Library React / jsdom | 3.2.7 / 16.3.3 / 25.0.1 | Testes |
| Node.js (CI) | 22 | Build e testes na GitHub Actions |

**Tamanho do build** (medido em 14/10/2026): pacote inicial ~54 kB (17,5 kB gzip) + CSS 23 kB; TanStack ~101 kB; Recharts ~540 kB (160 kB gzip) em chunk próprio, carregado só na tela Análises; resumo do dataset ~170 kB (19 kB gzip), carregado sob demanda.

### Backend (planejado)

Últimas versões publicadas no PyPI em 14/10/2026, **apenas como referência**. Ao criar o `pyproject.toml`, reconfira, fixe as versões e gere hashes (`pip install --require-hashes`).

| Pacote | Última versão em 14/10/2026 |
| --- | --- |
| FastAPI | 0.143.0 |
| Uvicorn | 0.54.0 |
| Pydantic | 2.14.1 |
| scikit-learn | 1.9.1 |
| pytest | 9.1.1 |

**Python:** alvo **3.12 ou superior**; o mínimo do projeto continua sendo 3.10 (biblioteca padrão nos scripts do dataset).

## Matriz de decisão

| Camada | Escolha | Alternativas consideradas | Por que a escolha | Riscos e mitigação | Situação |
| --- | --- | --- | --- | --- | --- |
| Banco de validação | **SQLite** (`sqlite3`) | PostgreSQL, DuckDB | Sem servidor nem porta, arquivo único, biblioteca padrão, `mode=ro` e `set_authorizer` para leitura | **Não tem usuários, GRANT nem RLS**: a autorização do MVP fica no backend. Mitigação: papéis fictícios no backend desde o MVP; PostgreSQL + RLS na etapa 05 | Planejado (01) |
| Banco empresarial | **PostgreSQL** para o laboratório | SQL Server, MySQL | RLS nativo, `pg_hba.conf`, TLS `verify-full`, open source | Cada SGBD corporativo tem outro modelo de permissões (o MySQL não tem RLS). Mitigação: conectores com **visões autorizadas** e contas de privilégio mínimo | Futuro (05) |
| API | **FastAPI + Pydantic** | Flask, Django | Validação tipada na borda, OpenAPI, TestClient, servidor ASGI leve | `/docs` exposto. Mitigação: desabilitar ou proteger fora do laboratório | Planejado (03) |
| Sessão local | **Cookie `HttpOnly` + `SameSite=Strict`**, senha com `scrypt` (`hashlib`) | JWT no navegador, Keycloak local | Sem dependência extra; o token não fica acessível a scripts da página | Não é identidade corporativa. Mitigação: OIDC/AD na etapa 05 | Planejado (02, 03) |
| Runtime de LLM | **Ollama** | llama.cpp server, vLLM, LM Studio | Instalação simples no Windows, gestão de modelos, API HTTP local, uso de GPU | **Sem autenticação** em `11434`; concorrência limitada. Mitigação: loopback e só o backend chama. **Nuvem desativada** com `OLLAMA_NO_CLOUD=1` ou `disable_ollama_cloud` em `~/.ollama/server.json`, com reinício e verificação pela mensagem `Ollama cloud disabled: true` no log (fonte: [FAQ do Ollama](https://docs.ollama.com/faq)). Contrapartida: sem modelos em nuvem e sem busca web. Na etapa 05, comparar com llama.cpp server/vLLM para multiusuário | Planejado (02) |
| Uso do LLM | **Classificar intenção + redigir explicação** | Text-to-SQL livre, agente com ferramentas | Mantém o SQL revisado e fora do alcance do modelo; respostas verificáveis | Utilidade limitada ao catálogo. Mitigação futura: camada semântica/visões e SQL validado por parser e allowlist, **depois** das metas da etapa 04 | Planejado (02) |
| Autorização no MVP | **Usuários e papéis fictícios no backend** | Sem autenticação até a etapa 05; Keycloak local | Testa a hipótese central desde o início, sem infraestrutura extra | Não representa identidade corporativa. Mitigação: mapear papéis para grupos OIDC/AD na etapa 05, com os mesmos testes | Planejado (02) |
| Qualidade de dados | **Regras SQL/Python + Isolation Forest** (scikit-learn) | LOF, One-Class SVM, z-score robusto | Regras explicáveis primeiro; Isolation Forest é simples, sem rótulos e com `random_state` | Circularidade com o gerador; dataset pequeno. Mitigação: ML exploratório, várias seeds (ver [08](08-anomalias-e-ml.md)) | Planejado (08, complementar) |
| Cifragem em repouso | **BitLocker** no disco do notebook | SQLCipher, cifragem do SGBD | Sem custo de código no MVP com dados sintéticos | O arquivo SQLite fica em claro para quem acessa a sessão do Windows. Mitigação: com dados reais, avaliar SQLCipher ou cifragem do SGBD | Planejado |
| Dependências Python | **`pip` com versões e hashes** (`--require-hashes`) | `uv`, Poetry | Sem ferramenta extra; reprodutível e verificável | Manutenção manual dos hashes. Mitigação: gerar com `pip-compile` ou equivalente ao criar o projeto | Planejado (01) |
| Frontend | **React 18 + TypeScript + Vite 6** | Streamlit, Next.js | SPA estática servida pelo FastAPI, sem servidor Node; tipagem; build rápido | Ecossistema npm (supply chain). Mitigação: lockfile, `npm ci`, poucas dependências | **Em uso** |
| Estilo e componentes | **Tailwind CSS 4 + padrão shadcn/ui** | CSS próprio, MUI, Chakra | Componentes copiados para o repositório (sem runtime de terceiros), tema por tokens CSS | Consistência depende de disciplina. Mitigação: primitivas em `components/ui/` | **Em uso** |
| Tabelas e dados | **TanStack Table + TanStack Query** | AG Grid, SWR | Headless, leve, paginação/ordenação manual para o servidor; cache e estados de carregamento | Paginação ainda no cliente. Mitigação: passar para o servidor na etapa 03 | **Em uso** |
| Gráficos | **Recharts 3** | ECharts, Chart.js | Componentes React declarativos, SVG acessível | Pacote grande (~540 kB). Mitigação: chunk separado, carregado só em Análises | **Em uso** |
| Testes | **pytest**, **Vitest + Testing Library** | unittest, Jest | Padrão de cada ecossistema; Vitest integrado ao Vite | — | Vitest **em uso**; pytest planejado |
| Dataset | **CSVs sintéticos + scripts stdlib** | Faker, SDV | Sem dependências, reproduzível, auditável por hash | Realismo limitado. Mitigação: limitações documentadas em `dataset_info.json` | **Em uso** (v2) |
| CI/CD | **GitHub Actions** | Execução manual, outro provedor de CI | Já integrado ao repositório; em PR roda dataset, testes e build, e só a `main` publica | Ações de terceiros. Mitigação: poucas ações, versões fixadas por major | **Em uso** |
| Demo pública | **GitHub Pages** (build estático) | Vercel, Netlify | Sem custo e sem servidor; a demo só usa dados sintéticos | O JSON vai para o build público. Mitigação: gerado só do dataset sintético, nunca do gabarito, e conferido pela CI | **Em uso** |

## Modelo local

**Requisitos:**
- caber em 6 GB de VRAM com contexto de pelo menos 4k tokens;
- bom desempenho em **português**;
- saída **JSON** confiável para a classificação de intenção;
- licença compatível com uso empresarial;
- distribuição oficial pelo registro do Ollama ou pelo fornecedor.

**Candidatos a avaliar** (3–4B parâmetros, quantização Q4). A lista é **ponto de partida, não recomendação**. As informações abaixo vêm de buscas em 14/10/2026; **a biblioteca oficial (`ollama.com/library`) não pôde ser consultada nesse dia**, então nenhuma tag ou tamanho deve ser tratado como confirmado.

| Família | Tamanho (indicativo) | Licença | Português | Situação da informação |
| --- | --- | --- | --- | --- |
| Qwen3 | 4B | Apache 2.0 | Multilíngue; **medir** | Licença citada por várias fontes secundárias; tags e tamanhos **a confirmar** |
| Llama 3.2 | 3B (~2 GB, segundo um guia) | Licença própria da Meta, com política de uso aceitável | Idioma oficialmente suportado, segundo a documentação da Meta (conhecimento prévio, **a confirmar**) | Tamanho de fonte secundária; licença **a ler** antes do uso empresarial |
| Gemma 3 | 4B (3,3 GB no README do Ollama) | Termos de uso próprios do Google; fontes conflitantes | Multilíngue; **medir** | Tamanho de fonte relativamente confiável; **termos de uso comercial a confirmar** com o Google |
| Gemma 4 | Vários tamanhos | **A verificar** | **A verificar** | Citada por uma única fonte secundária como sucessora do Gemma 3; **confirmar se existe, tamanhos e licença** |
| Granite 4 (micro) | 3B (~2,1 GB, contexto de 128K, segundo uma fonte) | Apache 2.0 (uma fonte) | **A verificar** | Fonte única; **confirmar tudo** |
| Phi-4 mini | ~3,8B | MIT (conhecimento prévio) | **A verificar**, historicamente mais forte em inglês | **Não confirmado** pelas buscas desta revisão |

**Antes de escolher:** consulte `ollama.com/library`, confira tag, tamanho, contexto e licença **de cada candidato**, e **registre a data da consulta** neste documento.

**Procedimento:** rodar as perguntas `normal` e `fora_escopo` de [`perguntas_assistente.csv`](../data/avaliacao/perguntas_assistente.csv) em cada candidato, com o mesmo prompt e temperatura 0. Medir:
- acerto de intenção e parâmetros;
- JSON inválido;
- latência p50/p95;
- VRAM/RAM.

Escolha o primeiro que atinja as metas da [etapa 04](04-testes-e-experimentos.md) e registre nome, tag, ID local (`ollama list`), licença e resultados de **todos** os candidatos.

**Procedência:**
- Baixe somente do registro oficial ou do fornecedor e registre o identificador.
- Não use formatos que executem código ao carregar.
- Não use modelos "fine-tuned" de origem desconhecida.

## Cadeia de dependências

| Ecossistema | Controle |
| --- | --- |
| npm (frontend) | `package-lock.json` commitado; `npm ci` na CI; atualizações revisadas |
| PyPI (backend) | Python ≥ 3.10; `requirements` com versões e hashes (`pip install --require-hashes`) a partir da etapa 01 |
| Modelos | Identificador registrado; download só na fase de preparo; offline depois |
| Dados | `data/MANIFEST.sha256` verificado por `validar_dataset.py` na CI |

## Decisões recentes

| Decisão | Motivo | Onde está |
| --- | --- | --- |
| Etapas numeradas na ordem de leitura: **00–05** (principal) e **06–08** (complementar) | A numeração antiga misturava as trilhas e confundia a leitura | [Guia de desenvolvimento](README.md) |
| Dados em **LF** (`.gitattributes`) | Os hashes do `MANIFEST.sha256` dependem dos bytes do arquivo; `core.autocrlf` no Windows os alteraria | `.gitattributes` |
| CI valida o dataset e confere o resumo gerado antes de publicar | Impede que a demo exiba números diferentes dos CSVs | `.github/workflows/deploy-pages.yml` |
| Nome do repositório mantido: **`dataguard-ai`** | O nome e o endereço da demo já são conhecidos; renomear quebraria o link do Pages | — |
| Base do Vite derivada do nome do repositório | A demo sobrevive a uma eventual renomeação | `frontend/vite.config.ts` |
| Descrição e tópicos do GitHub centrados em segurança de IA local | Refletem o objetivo real do projeto | Configurações do repositório |

## Decisões em aberto

| Tema | Situação | O que decidir |
| --- | --- | --- |
| **Licença do repositório** | O repositório é público e **não tem arquivo `LICENSE`**: sem licença, ninguém pode reutilizar o código legalmente | Escolher uma (MIT e Apache-2.0 são comuns) ou manter todos os direitos reservados. **Nenhuma foi adicionada sem decisão** |
| React 18 × 19 | Em uso: 18.3.1 | Avaliar a migração para o 19 e a compatibilidade das bibliotecas (shadcn/ui, Recharts, TanStack) |
| Modelo local | Candidatos sem verificação oficial | Consultar a biblioteca do Ollama, medir e escolher (ver [Modelo local](#modelo-local)) |
| Python do backend | Alvo 3.12+ | Fixar a versão ao criar o `pyproject.toml` |
| Cifragem do SQLite | BitLocker no MVP | Decidir por SQLCipher ou cifragem do SGBD antes de qualquer dado real |

## Decisões revistas

| Antes | Agora | Motivo |
| --- | --- | --- |
| Interface em Streamlit/Plotly | React + FastAPI | Separação clara entre interface e backend; distribuição estática sem servidor Python de UI |
| Autenticação só na etapa 05 | Papéis fictícios no MVP | A autorização é a hipótese central e precisa ser testada desde o corte vertical |
| Stack de UI declarada, mas não usada | Protótipo migrado para Tailwind, shadcn/ui, TanStack e Recharts | Alinhar documentação e código |
| Dataset v1 | Dataset v2 sem vazamento de rótulos | IDs contíguos, textos, horários e datas denunciavam as anomalias |
| Recharts 2 | Recharts 3 | A linha 2.x foi descontinuada |
| Anomalias e ML no centro do roadmap | Segurança da IA local no centro; anomalias como trilha complementar | O objetivo do projeto é a integração segura de IA a dados empresariais |
| Numeração 00, 01, 05, 06, 07, 08, 02, 03, 04 | Numeração sequencial 00–08 | Acompanha a ordem real de leitura |

## Fontes

- [FAQ do Ollama](https://docs.ollama.com/faq): `OLLAMA_NO_CLOUD` e `disable_ollama_cloud` (consultada em 14/10/2026).
- [README do Ollama](https://cdn.jsdelivr.net/gh/ollama/ollama@0.9.0/README.md): tamanho do Gemma 3 4B (versão 0.9.0, antiga).
- Listas de modelos de terceiros, **fontes secundárias** e de qualidade irregular: [Morph](https://www.morphllm.com/best-ollama-models), [Toolhalla](https://toolhalla.ai/blog/best-ollama-models-2026). Servem só para levantar candidatos, nunca para confirmar licença ou tamanho.
- Versões do backend: `pip index versions` em 14/10/2026. Versões do frontend: `frontend/package-lock.json`.

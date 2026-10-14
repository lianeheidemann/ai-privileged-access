# Decisões tecnológicas

Este documento registra **por que** cada tecnologia foi escolhida, quais alternativas foram consideradas e quais riscos permanecem. Ele complementa as tabelas de stack do [README](../README.md) e da [etapa 00](00-arquitetura-e-escopo.md).

**Como ler:** "Situação" indica se a escolha já está em uso no repositório ou é planejada. As versões alvo são as atuais no momento da decisão. **Fixe versões exatas** (lockfile, hashes) ao implementar e reavalie as escolhas se uma premissa mudar.

## Critérios gerais

1. **Execução 100% local** depois do preparo, sem dependência de serviços externos em runtime.
2. **Superfície de ataque pequena:** poucos serviços, bind em loopback, sem portas de banco.
3. **Testabilidade:** cada controle de segurança precisa de teste automatizado.
4. **Hardware de referência:** notebook Windows 11, 16 GB de RAM, RTX 3060 Laptop com 6 GB de VRAM.
5. **Curva de aprendizado e manutenção** compatíveis com um projeto de estudo individual.
6. **Caminho para a empresa:** a escolha do MVP não pode impedir a etapa 05 (rede privada, outros SGBDs).

## Matriz de decisão

| Camada | Escolha | Alternativas consideradas | Por que a escolha | Riscos e mitigação | Situação |
| --- | --- | --- | --- | --- | --- |
| Banco de validação | **SQLite** (`sqlite3`) | PostgreSQL, DuckDB | Sem servidor nem porta, arquivo único, biblioteca padrão, `mode=ro` e `set_authorizer` para leitura | **Não tem usuários, GRANT nem RLS**: a autorização do MVP fica no backend. Mitigação: papéis fictícios no backend desde o MVP; PostgreSQL + RLS na etapa 05 | Planejado (01) |
| Banco empresarial | **PostgreSQL** para o laboratório | SQL Server, MySQL | RLS nativo, `pg_hba.conf`, TLS `verify-full`, open source | Cada SGBD corporativo tem outro modelo de permissões (o MySQL não tem RLS). Mitigação: conectores com **visões autorizadas** e contas de privilégio mínimo | Futuro (05) |
| API | **FastAPI + Pydantic** | Flask, Django | Validação tipada na borda, OpenAPI, TestClient, servidor ASGI leve | `/docs` exposto. Mitigação: desabilitar ou proteger fora do laboratório | Planejado (03) |
| Runtime de LLM | **Ollama** | llama.cpp server, vLLM, LM Studio | Instalação simples no Windows, gestão de modelos, API HTTP local, uso de GPU | **Sem autenticação** em `11434`; concorrência limitada; recursos de nuvem. Mitigação: loopback, `OLLAMA_NO_CLOUD`, só o backend chama. Na etapa 05, comparar com llama.cpp server/vLLM para multiusuário | Planejado (02) |
| Uso do LLM | **Classificar intenção + redigir explicação** | Text-to-SQL livre, agente com ferramentas | Mantém o SQL revisado e fora do alcance do modelo; respostas verificáveis | Utilidade limitada ao catálogo. Mitigação futura: camada semântica/visões e SQL validado por parser e allowlist, **depois** das metas da etapa 04 | Planejado (02) |
| Autorização no MVP | **Usuários e papéis fictícios no backend** | Sem autenticação até a etapa 05; Keycloak local | Testa a hipótese central desde o início, sem infraestrutura extra | Não representa identidade corporativa. Mitigação: mapear papéis para grupos OIDC/AD na etapa 05, com os mesmos testes | Planejado (02) |
| Qualidade de dados | **Regras SQL/Python + Isolation Forest** (scikit-learn) | LOF, One-Class SVM, z-score robusto | Regras explicáveis primeiro; Isolation Forest é simples, sem rótulos e com `random_state` | Circularidade com o gerador; dataset pequeno. Mitigação: ML exploratório, várias seeds (ver [08](08-anomalias-e-ml.md)) | Planejado (08, complementar) |
| Frontend | **React 18 + TypeScript + Vite 6** | Streamlit, Next.js | SPA estática servida pelo FastAPI, sem servidor Node; tipagem; build rápido | Ecossistema npm (supply chain). Mitigação: lockfile, `npm ci`, poucas dependências | **Em uso** |
| Estilo e componentes | **Tailwind CSS 4 + padrão shadcn/ui** | CSS próprio, MUI, Chakra | Componentes copiados para o repositório (sem runtime de terceiros), tema por tokens CSS | Consistência depende de disciplina. Mitigação: primitivas em `components/ui/` | **Em uso** |
| Tabelas e dados | **TanStack Table + TanStack Query** | AG Grid, SWR | Headless, leve, paginação/ordenação manual para o servidor; cache e estados de carregamento | Paginação ainda no cliente. Mitigação: passar para o servidor na etapa 03 | **Em uso** |
| Gráficos | **Recharts 3** | ECharts, Chart.js | Componentes React declarativos, SVG acessível | Pacote grande (~540 kB). Mitigação: chunk separado, carregado só em Análises | **Em uso** |
| Testes | **pytest**, **Vitest + Testing Library** | unittest, Jest | Padrão de cada ecossistema; Vitest integrado ao Vite | — | Vitest **em uso**; pytest planejado |
| Dataset | **CSVs sintéticos + scripts stdlib** | Faker, SDV | Sem dependências, reproduzível, auditável por hash | Realismo limitado. Mitigação: limitações documentadas em `dataset_info.json` | **Em uso** (v2) |

## Modelo local

**Requisitos:**
- caber em 6 GB de VRAM com contexto de pelo menos 4k tokens;
- bom desempenho em **português**;
- saída **JSON** confiável para a classificação de intenção;
- licença compatível com uso empresarial;
- distribuição oficial pelo registro do Ollama ou pelo fornecedor.

**Candidatos a avaliar** (3–4B parâmetros, quantização Q4). A lista é **ponto de partida, não recomendação**; confira as tags e licenças vigentes no momento da implementação:

| Família | Motivo para avaliar |
| --- | --- |
| Qwen (3–4B) | Multilíngue, bom em saídas estruturadas |
| Llama 3.2 3B | Ampla adoção, documentação abundante |
| Gemma (≈4B) | Multilíngue, tamanho compatível com 6 GB |
| Phi mini (≈3.8B) | Bom raciocínio para o tamanho; verificar a qualidade em português |

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

## Decisões revistas

| Antes | Agora | Motivo |
| --- | --- | --- |
| Interface em Streamlit/Plotly | React + FastAPI | Separação clara entre interface e backend; distribuição estática sem servidor Python de UI |
| Autenticação só na etapa 05 | Papéis fictícios no MVP | A autorização é a hipótese central e precisa ser testada desde o corte vertical |
| Stack de UI declarada, mas não usada | Protótipo migrado para Tailwind, shadcn/ui, TanStack e Recharts | Alinhar documentação e código |
| Dataset v1 | Dataset v2 sem vazamento de rótulos | IDs contíguos, textos, horários e datas denunciavam as anomalias |
| Recharts 2 | Recharts 3 | A linha 2.x foi descontinuada |

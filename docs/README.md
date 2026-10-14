# Guia de desenvolvimento — DataGuard AI

Este é o **ponto de partida** para construir o DataGuard AI em partes. O objetivo principal é validar os **controles de segurança** de uma IA local que consulta dados empresariais: autorização por papel, catálogo de consultas somente leitura, minimização, resistência a prompt injection e operação sem inferência externa. O inventário sintético é apenas o caso de teste.

**Situação atual:**
- **Disponível:** dataset sintético **v2** validado ([`scripts/dataset/`](../scripts/dataset/README.md)), conjunto de perguntas de avaliação e protótipo visual React testado.
- **A implementar:** banco SQLite operacional, serviços Python, API FastAPI, autorização e integração com o Ollama.

**Regra transversal:** os requisitos de rede, egress, identidade, autorização e confidencialidade são definidos na etapa 00 e verificados em cada etapa. A etapa 08 executa a **implantação empresarial**; ela não inaugura o planejamento de segurança.

## Duas trilhas

```mermaid
flowchart LR
    A["00 · Planejar"] --> B["01 · Banco"]
    B --> C["05 · Corte vertical"]
    C --> D["06 · FastAPI + React"]
    D --> E["07 · Testes e metas"]
    E -. "implantação posterior" .-> F["08 · Rede privada"]
    B -. "complementar" .-> G["02 · Integridade"] -.-> H["03 · Auditoria"] -.-> I["04 · Anomalias"]
```

**Trilha principal (segurança da IA local):** 00 → 01 → 05 → 06 → 07 → 08. Logo após a etapa 01, o **corte vertical** da etapa 05 exercita de ponta a ponta a hipótese central:

> pergunta → papel fictício → intenção do catálogo → SQL parametrizado em conexão somente leitura → resultado limitado → Ollama local redige a explicação.

Isso valida cedo o hardware, a qualidade do modelo em português e os controles de acesso, antes de investir na interface.

**Trilha complementar (qualidade dos dados):** 02 → 03 → 04. São análises úteis sobre os dados (integridade, evidências, anomalias) que podem ser feitas em paralelo ou depois, sem bloquear a trilha principal. O assistente só usa resultados dessa trilha (por exemplo, a intenção `resumo_alertas`) quando ela existir.

| Etapa | Trilha | Documento | Entrega verificável |
| --- | --- | --- | --- |
| 00 | Principal | [Arquitetura e escopo](00-arquitetura-e-escopo.md) | Limites, ameaças e decisões registrados |
| 01 | Principal | [Ambiente e banco](01-ambiente-e-banco.md) | SQLite gerado dos CSVs validados; relações conferidas |
| 05 | Principal | [Assistente local](05-assistente-local.md) | Corte vertical com papéis, catálogo somente leitura e Ollama |
| 06 | Principal | [Interface e relatórios](06-interface-e-relatorios.md) | API FastAPI e protótipo React conectado, local e offline |
| 07 | Principal | [Testes e experimentos](07-testes-e-experimentos.md) | Metas numéricas medidas e teste offline |
| 08 | Implantação posterior | [Rede e segurança](08-arquitetura-de-rede-e-seguranca.md) | Rede privada, PostgreSQL/RLS, identidade e testes de vazamento |
| 02 | Complementar | [Integridade e transações](02-integridade-e-transacoes.md) | Verificador com testes de falha e rollback |
| 03 | Complementar | [Auditoria e backups](03-auditoria-e-backups.md) | Evidências verificáveis e restauração testada |
| 04 | Complementar | [Anomalias e ML](04-anomalias-e-ml.md) | Alertas com evidências; ML exploratório |

Referência transversal: [**Decisões tecnológicas**](decisoes-tecnologicas.md), com alternativas, riscos e critérios de escolha do modelo.

## Stack e situação

| Camada | Tecnologia | Situação |
| --- | --- | --- |
| Frontend | React 18 + TypeScript + Vite 6 | **Implementado** (protótipo visual) |
| Estilo e componentes | Tailwind CSS 4 + padrão shadcn/ui + Lucide React | **Implementado** |
| Tabelas, dados e gráficos | TanStack Table/Query + Recharts | **Implementado** (API simulada local) |
| Scripts do dataset | Python (biblioteca padrão) | **Implementado** |
| Banco | Python + SQLite | Etapa 01 |
| Autorização local | Papéis fictícios aplicados no backend | Etapa 05 |
| IA local e consultas | Python + Ollama | Etapa 05 |
| Backend web | Python + FastAPI + Pydantic | Etapa 06 |
| Qualidade de dados | Python + scikit-learn | Etapas 02–04 (complementar) |
| Servidor de banco em rede privada | PostgreSQL, RLS, TLS, identidade corporativa | Etapa 08 |

**Interface web local não é hospedagem na internet.** Durante o desenvolvimento, Vite e FastAPI usam `127.0.0.1`. Depois do build, o FastAPI servirá os arquivos React. Somente o backend acessa o SQLite e o Ollama.

## Como implementar cada etapa

1. Leia o documento da etapa atual e o trecho correspondente de [decisões tecnológicas](decisoes-tecnologicas.md).
2. Crie os arquivos especificados, sem antecipar módulos de fases posteriores.
3. Escreva testes para o comportamento principal, **inclusive casos negados e de falha**.
4. Execute os testes e compare com os **critérios de aceite** e as metas da [etapa 07](07-testes-e-experimentos.md).
5. Registre limitações e decisões no commit ou nas anotações da etapa.
6. Só avance quando a etapa funcionar isoladamente.

### Padrão de trabalho sugerido

- Um branch por etapa, como `feat/01-sqlite-dataset` e `feat/05-vertical-slice`.
- Commits pequenos, com prefixos objetivos (`feat:`, `test:`, `docs:`, `fix:`).
- A aplicação nunca carrega `gabarito_anomalias.csv` na execução normal.
- Dependências com versões travadas (`package-lock.json`; `requirements` com hashes quando o backend existir).
- Nunca enviar bancos reais, chaves, `.env`, modelos, backups ou logs privados ao GitHub.
- Mudanças no dataset passam por script revisado, `validar_dataset.py` e regeneração do manifesto. Mudanças no esquema viram migration.

## Estrutura prevista

```text
dataguard-ai/
├── README.md
├── docs/                         # Guias (esta pasta)
├── data/
│   ├── csv/                      # Dados sintéticos v2
│   ├── ground_truth/             # Gabarito, somente avaliação
│   ├── avaliacao/                # Perguntas do assistente com respostas esperadas
│   ├── dataset_info.json
│   └── MANIFEST.sha256
├── scripts/dataset/              # Validação e geração (implementado)
├── config/                       # Exemplos sem segredos (implementado)
├── frontend/                     # Protótipo React (implementado)
├── src/dataguard/                # Backend, a partir da etapa 01
│   ├── db/  security/  assistant/  api/  reports/
│   └── integrity/  audit/  detection/   # trilha complementar
├── tests/                        # A partir da etapa 01
├── runtime/                      # Local; ignorado no Git
├── pyproject.toml                # Etapa 01
└── .gitignore                    # Já existe
```

## Primeira tarefa

Abra [**01 — Ambiente e banco**](01-ambiente-e-banco.md): rode `validar_dataset.py`, importe os seis CSVs, crie o SQLite e confira contagens e relações, **sem IA e sem interface**. Em seguida, vá direto para o corte vertical da [etapa 05](05-assistente-local.md).

## Regra geral de qualidade

| Pergunta | Exemplo |
| --- | --- |
| Qual é a entrada? | Arquivo CSV, evento, pergunta, papel do usuário |
| Qual é a saída? | Consulta, resultado, negação, alerta ou relatório |
| O que pode falhar? | FK inválida, consulta fora do escopo, prompt injection, Ollama indisponível |
| Como provar que funciona? | Teste reproduzível com resultado esperado, **inclusive o caso negado** |
| Qual é o limite? | Um score estatístico **não confirma erro**; loopback **não substitui autorização** |

Voltar ao [README principal](../README.md).

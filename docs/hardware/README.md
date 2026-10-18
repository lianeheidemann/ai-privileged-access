# Dimensionamento de hardware

> **Última revisão:** 14/10/2026.

Este documento dimensiona o hardware do AI Privileged Access para quatro cenários: o **MVP** em um notebook, um **piloto**, um **departamento** e uma **empresa** com alta disponibilidade. Ele complementa a [stack e decisões de software](../software/00-stack-e-decisoes-de-software.md) e a [etapa 07](../software/07-arquitetura-de-rede-e-seguranca.md).

## Como ler este documento

**Nada aqui foi medido.** Todos os números são de dois tipos:

- **Estimativa:** regra de bolso calculada ou citada de fontes secundárias (blogs e guias, listados em [Fontes](#fontes)), com qualidade irregular e divergências entre si.
- **A medir:** valor que só existe depois dos testes da [etapa 06](../software/06-testes-e-experimentos.md), no seu hardware e com o seu modelo.

Use este documento para **planejar e cotar**, nunca como garantia de desempenho. A comparação entre cenários é de ordem de grandeza. O custo aparece só como faixa **relativa** (baixo, médio, alto, muito alto), porque preços de GPU e servidor mudam rápido e não foram verificados.

## O que consome recursos

Quase todo o hardware é para o **modelo de linguagem**. O resto é pequeno:

| Componente | Peso no hardware | Observação |
| --- | --- | --- |
| Modelo de linguagem (Ollama ou similar) | **Dominante** | Memória da GPU (ou RAM, se rodar na CPU) e vazão em tokens por segundo |
| Banco de dados | Pequeno | O dataset sintético tem ~408 KB; SQLite não tem servidor. Um banco real cresce com os dados da empresa |
| API (FastAPI) | Pequeno | Validação, autorização e consultas; sem processamento pesado |
| Frontend | Desprezível | O build tem ~948 KB e é servido como arquivos estáticos |

### Regra de memória do modelo (estimativa)

```text
memória ≈ pesos + KV cache + folga

pesos     ≈ parâmetros (em bilhões) × ~0,55 a 0,6 GB   (quantização Q4_K_M, ≈ 4,5 bits por peso)
KV cache  ≈ cresce com o tamanho do contexto E com o número de usuários simultâneos
folga     ≈ 10% a 20% da memória da GPU, mais 1 a 4 GB em repouso
```

Aplicada a tamanhos comuns de modelo (valores **calculados pela regra**; apenas 7B e 70B têm faixa citada por fontes):

| Parâmetros | Pesos em Q4 (estimativa) | Observação |
| --- | --- | --- |
| 3–4B | ~2 a 2,5 GB | Faixa do MVP |
| 7–8B | ~4,5 a 5 GB | Faixa citada por fontes |
| 14B | ~8 a 8,5 GB | Calculado, não confirmado |
| 32B | ~18 a 19 GB | Calculado; uma fonte aponta GPU de 24 GB como o ponto prático para 32B em Q4 |
| 70B | ~38 a 40 GB | As fontes divergem (35 a 43 GB) |

**O ponto que mais engana:** a **concorrência pesa mais que os pesos**. O KV cache de cada usuário simultâneo soma-se ao modelo, e contextos longos o multiplicam. Uma fonte dá como exemplo um modelo de 70B, que sozinho ocupa ~35 GB, passando de 80 GB ao atender 50 usuários simultâneos com contexto de 8K. Por isso, ao crescer, a solução costuma ser um **modelo menor, contexto mais curto ou mais GPUs**, e não só uma GPU maior.

## Cenário 1 — MVP: 1 usuário, um notebook

É o ambiente de validação, com tudo em `127.0.0.1` e dados sintéticos.

| Item | Mínimo (estimativa) | Recomendado (estimativa) | Referência do projeto |
| --- | --- | --- | --- |
| GPU | Sem GPU dedicada (roda na CPU, mais lento) | GPU NVIDIA com 6 a 8 GB de VRAM | **RTX 3060 Laptop, 6 GB** |
| RAM | 16 GB | 16 a 32 GB | **16 GB** |
| CPU | 4 núcleos | 6 a 8 núcleos | A registrar na etapa 06 |
| Disco | SSD com 20 GB livres | SSD com 50 GB livres | A registrar |
| Sistema | Windows 11 | Windows 11 com BitLocker | **Windows 11** |
| Modelo | 3–4B em Q4 | 3–4B em Q4 | A escolher (ver [Modelo local](../software/00-stack-e-decisoes-de-software.md#modelo-local)) |

**O que cabe nos 6 GB da referência (estimativa):**
- Um modelo de **3–4B em Q4** (pesos de ~2 a 2,5 GB) cabe com contexto de cerca de 4k tokens e folga.
- Um modelo de **7–8B** (pesos de ~4,5 a 5 GB) **quase não deixa espaço para o contexto**: parte vai para a CPU e a resposta fica bem mais lenta. Evite no MVP.
- **Sem GPU**, o assistente funciona, mas a meta de **p95 ≤ 15 s** pode não ser cumprida. **A medir.**

**Disco:** espaço para 2 a 3 modelos candidatos durante a avaliação, mais o runtime. Baixe-os antes de desconectar a internet.

**Notebook:** carga contínua de GPU esquenta e reduz o desempenho. Use na tomada, com boa ventilação, e registre se houve queda de velocidade durante os testes.

**Como medir** (e registrar na [etapa 06](../software/06-testes-e-experimentos.md)):

```powershell
# Modelo carregado, tamanho em memória e quanto está na GPU
ollama ps
# Uso de memória e de GPU durante as respostas
nvidia-smi
# Carga da CPU
Get-Counter '\Processor(_Total)\% Processor Time'
```

Anote CPU, GPU, RAM, VRAM, sistema, versão do driver, modelo e quantização, latência p50/p95 e a memória de pico. Modelo de registro:

| Hardware (CPU/GPU/RAM/VRAM) | Driver | Modelo e quantização | Latência p50 / p95 | Memória de pico | Concorrência | Data |
| --- | --- | --- | --- | --- | --- | --- |
| _a preencher_ | | | | | | |

## Cenário 2 — Piloto: ~5 a 10 usuários, um servidor

Para validar com um grupo pequeno de usuários autorizados. **Dados sensíveis de produção só entram depois que os controles de segurança da [etapa 07](../software/07-arquitetura-de-rede-e-seguranca.md) estiverem implementados e testados.**

| Item | Estimativa |
| --- | --- |
| GPU | Uma GPU de **16 a 24 GB**: modelo de 7–8B com folga de contexto, ou 14B em Q4 |
| RAM | 32 a 64 GB |
| CPU | 8 a 16 núcleos |
| Disco | NVMe de 500 GB a 1 TB; backup em **disco ou volume separado** |
| Sistema | Linux (servidor) |
| Topologia | Um host com banco (PostgreSQL), API e gateway em contêineres, **sem publicar portas do banco nem do Ollama** (ver [etapa 07](../software/07-arquitetura-de-rede-e-seguranca.md)) |
| Motor de inferência | Ollama, com ajuste de paralelismo |
| Energia | Nobreak para desligar com segurança |

**Ajuste do Ollama para vários usuários** (de uma fonte secundária; **confirmar no [FAQ oficial](https://docs.ollama.com/faq)**):
- `OLLAMA_NUM_PARALLEL`: requisições simultâneas por modelo (padrão 4, ou 1 com pouca memória). Mais paralelismo aumenta a vazão, mas também a memória usada e a latência.
- `OLLAMA_MAX_QUEUE`: tamanho da fila (padrão 512); com a fila cheia, as novas requisições recebem erro 503.
- `OLLAMA_MAX_LOADED_MODELS`: quantos modelos ficam carregados ao mesmo tempo.

Monitore a fila e a memória da GPU. Fila crescente com a GPU cheia é o sinal de que é hora de subir de nível (veja [Como dimensionar](#como-dimensionar-de-verdade)).

## Cenário 3 — Departamento: ~30 a 50 usuários

Aqui o **motor de inferência** passa a importar tanto quanto a GPU.

| Item | Estimativa |
| --- | --- |
| Servidor de IA | **Separado** do banco; GPU de **24 a 48 GB** (uma ou mais), RAM de 64 a 128 GB |
| Motor de inferência | Com **processamento contínuo em lote** (vLLM ou equivalente), no lugar do Ollama |
| Servidor de banco | PostgreSQL em servidor próprio: 8 a 16 núcleos, 32 a 64 GB de RAM, SSD/NVMe |
| Gateway | Proxy com TLS (HTTPS) na frente da API |
| Rede | Segmentada em redes/VLANs: o cliente alcança só o gateway; banco e IA ficam isolados (ver matriz da [etapa 07](../software/07-arquitetura-de-rede-e-seguranca.md)) |
| Operação | Monitoramento de GPU, fila, latência e disco; backup **fora do host** |

**Por que trocar o motor:** comparativos de terceiros indicam que o vLLM escala melhor que o Ollama com muitos usuários simultâneos, e que o Ollama atende bem de 1 a cerca de 10. Esses comparativos têm metodologias diversas e **seus números de vazão não foram copiados aqui**; confirme com um teste de carga seu.

## Cenário 4 — Empresa: 100+ usuários e alta disponibilidade

**Só ordem de grandeza.** Dimensionar de verdade exige teste de carga e a definição de metas de disponibilidade (quanto de parada é tolerável).

| Item | Direção |
| --- | --- |
| IA | **Vários nós com GPU** atrás de um balanceador, para vazão e para continuar atendendo se um nó falhar |
| Banco | PostgreSQL com **réplica** e failover; backups testados |
| Gateway | Redundante, com TLS |
| Armazenamento | Backup **fora do site** e plano de recuperação de desastre |
| Operação | Monitoramento e alertas contínuos, janelas de manutenção, atualização controlada de modelos |
| Segurança | Identidade corporativa, segmentação, registros de auditoria (etapa 07) |

## Quadro comparativo

| Cenário | Usuários | GPU (estimativa) | RAM | Motor de inferência | Topologia | Custo relativo |
| --- | --- | --- | --- | --- | --- | --- |
| 1. MVP | 1 | 6 a 8 GB (ou nenhuma) | 16 a 32 GB | Ollama | Notebook, tudo em loopback | **Baixo** |
| 2. Piloto | ~5 a 10 | 16 a 24 GB | 32 a 64 GB | Ollama ajustado | 1 servidor | **Médio** |
| 3. Departamento | ~30 a 50 | 24 a 48 GB (1 ou mais) | 64 a 128 GB (IA) | vLLM ou equivalente | IA e banco separados, rede segmentada | **Alto** |
| 4. Empresa | 100+ | Vários nós | A definir em teste | vLLM ou equivalente | Vários nós, réplica, alta disponibilidade | **Muito alto** |

Os limites de usuários são **indicativos**: dependem do modelo, do tamanho do contexto e de quantos usuários perguntam ao mesmo tempo.

## Como dimensionar de verdade

1. **Meça a concorrência, não os usuários cadastrados.** O que importa é o **pico de requisições simultâneas**. Registre-o em uso real ou em teste de carga.
2. **Use o conjunto de avaliação** ([`perguntas_assistente.csv`](../../data/avaliacao/perguntas_assistente.csv)) como carga: repita-o com 1, 5, 10 e 20 requisições simultâneas e registre latência p50/p95, tokens por segundo, fila e uso de memória da GPU.
3. **Compare com as metas** da [etapa 06](../software/06-testes-e-experimentos.md) (p95 ≤ 15 s como alvo inicial).
4. **Suba de nível quando houver sinais claros**:

| Sinal | Ação provável |
| --- | --- |
| p95 acima da meta com carga normal | Modelo menor, contexto mais curto, quantização mais agressiva ou mais GPU |
| Fila crescendo de forma sustentada | Mais paralelismo (se houver memória) ou mais GPU/nós |
| Memória da GPU acima de ~90% | Reduzir contexto ou paralelismo, ou GPU com mais memória |
| Erros 503 do Ollama | Fila cheia: subir de cenário ou trocar de motor |
| Mais de ~10 usuários simultâneos de forma recorrente | Avaliar motor com processamento em lote |

## Outros requisitos

- **Rede:** o gargalo é a GPU, não a banda; **1 GbE** costuma bastar entre servidores. O importante é a **segmentação** e o bloqueio de saída ([etapa 07](../software/07-arquitetura-de-rede-e-seguranca.md)).
- **Energia e refrigeração:** nobreak nos servidores; ventilação adequada, principalmente para GPUs sob carga contínua.
- **Drivers e compatibilidade:** confirme a compatibilidade entre GPU, driver e motor de inferência antes de comprar. Placas de fabricantes diferentes têm suporte diferente.
- **Sistema:** Windows 11 no MVP; **Linux** nos servidores. Docker e WSL2 podem alterar a exposição de portas (etapa 07).
- **Armazenamento:** SSD/NVMe para modelos e banco; backup fora do host.
- **Segurança do equipamento:** cifragem de disco (BitLocker ou equivalente); servidores em ambiente com acesso controlado.

## Itens a cotar

Ao pedir orçamento, informe o cenário e peça:

- GPU(s): modelo, **memória**, consumo, compatibilidade com o motor escolhido;
- servidor: CPU, RAM, NVMe, fonte e refrigeração dimensionadas para a GPU;
- banco: servidor ou serviço, com réplica no cenário 4;
- rede: switch gerenciável com VLAN, firewall e, se for o caso, balanceador;
- energia: nobreak com autonomia suficiente para um desligamento seguro;
- backup: destino separado do host e, no cenário 4, fora do site;
- licenças e suporte do sistema operacional e do SGBD.

## Fontes

Fontes **secundárias** e de qualidade irregular; servem para ordem de grandeza, não para confirmar números. Consultadas em 14/10/2026:

- Memória por tamanho de modelo e KV cache: [PremAI](https://www.premai.io/blog/llm-infrastructure-sizing-from-hardware-requirements-to-production-capacity/), [Computing for Geeks](https://computingforgeeks.com/how-much-vram-to-run-llm/).
- Paralelismo do Ollama: [Glukhov](https://www.glukhov.org/post/2025/05/how-ollama-handles-parallel-requests/). **Confirmar** no [FAQ oficial](https://docs.ollama.com/faq).
- Motores de inferência: [Computing for Geeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/), [InsiderLLM](https://insiderllm.com/guides/llamacpp-vs-ollama-vs-vllm/).

**Ainda precisa ser confirmado:** o FAQ oficial do Ollama sobre paralelismo e fila; a memória de 14B e 32B nos modelos escolhidos (consulte a arquitetura de cada um); e a vazão de cada motor no seu hardware, com seu próprio teste de carga.

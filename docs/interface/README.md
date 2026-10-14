# Interfaces — guia de direção visual

Documentação breve para orientar a criação das telas do DataGuard AI. **São referências, não layouts fechados.** A interface ainda não foi implementada.

## Direção geral

- Visual minimalista, moderno e profissional, sem excesso de elementos.
- Priorizar legibilidade, navegação simples e hierarquia clara.
- Manter consistência entre componentes e suporte aos temas claro e escuro.
- Usar tabelas, gráficos e indicadores apenas quando forem úteis.
- Adaptar as telas ao conteúdo real, sem seguir um modelo visual rígido.

## Telas planejadas

| Tela | Foco |
| --- | --- |
| Visão geral | Resumo das fontes, análises e atividades |
| Fontes de dados | Conexões e informações das fontes autorizadas |
| Consultas | Consultas disponíveis e seus resultados |
| Análises | Integridade, anomalias e outras verificações |
| Assistente | Perguntas sobre dados acessíveis ao usuário |
| Auditoria | Histórico de operações e evidências |
| Configurações | Preferências e controles permitidos |

**Módulos de demonstração:** inventário, integridade, anomalias e backups podem ganhar telas próprias conforme a necessidade, sem definir toda a navegação do produto.

## Orientações para implementação

Criar e revisar cada tela individualmente, começando pela organização das informações. Evitar decisões visuais excessivamente detalhadas antes de testar a interface.

**Segurança:** a interface não acessa bancos ou Ollama diretamente; todas as ações passam pela API interna e suas verificações de permissão.

Ver também [etapa 06 — Interface e relatórios](../06-interface-e-relatorios.md).

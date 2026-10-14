# Interfaces — guia de direção visual

Documentação breve para orientar as telas do DataGuard AI. **São referências, não layouts fechados.** O [protótipo visual](../../frontend/README.md) já implementa as sete telas com dados sintéticos, sem backend. A conexão à API ocorre na [etapa 03](../03-interface-e-relatorios.md).

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
| Análises | Exploração, resumos e verificações de qualidade dos dados |
| Assistente | Perguntas sobre dados acessíveis ao usuário |
| Relatórios | Visualização e exportação de resultados autorizados |
| Configurações | Preferências e controles permitidos |

**Recursos complementares:** histórico de operações ([auditoria](auditoria.md)), verificações de qualidade e módulos demonstrativos podem ganhar telas próprias conforme a trilha complementar avançar, sem definir toda a navegação do produto.

## Orientações para implementação

Criar e revisar cada tela individualmente, começando pela organização das informações. Evitar decisões visuais excessivamente detalhadas antes de testar a interface.

**Segurança:** a interface não acessa bancos ou Ollama diretamente; todas as ações passam pela API interna e suas verificações de permissão. Toda tela precisa de um estado **acesso negado**, além de carregando, vazio e erro.

Ver também [etapa 03 — Interface e relatórios](../03-interface-e-relatorios.md).

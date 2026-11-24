# Validação da entrega

Verificação realizada em 24/11/2026.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Regras de CPF, duração e sobreposição | 3 testes passaram |
| Integração HTTP com MySQL 8.4 em Docker | 7 cenários passaram, além do teste principal |
| Interface em Chromium com Playwright | 2 testes passaram |
| Painel em largura de celular (390 px) | Sem transbordamento horizontal |
| Build local da interface com Node 22 e Vite | Passou |
| Build da imagem final React + Nginx | Passou |
| Configuração Nginx dentro da imagem | nginx -t passou |
| Compose principal e sobreposição de produção | Configurações válidas |
| Auditoria npm do backend | 0 vulnerabilidades reportadas |
| Auditoria npm do frontend | 0 vulnerabilidades reportadas |
| Gitignore | Dependências, builds, ambientes e resultados de testes ignorados |

A auditoria reflete os avisos conhecidos no momento da execução e não substitui revisões futuras.

## O que foi exercitado

A integração usou banco descartável, sem montar o volume da aplicação. Verificou a criação idempotente do primeiro administrador, login com CPF formatado, rejeição de credenciais e tokens inválidos, permissões por perfil, cadastro e edição de pacientes, CPF duplicado e inválido, cadastro de dentistas e preservação de cadastros vinculados.

A agenda foi testada com criação, listagem com associações, conflitos de paciente e dentista, intervalos adjacentes, duração inválida, referência inexistente, edição que gera conflito, atualização por dentista, cancelamento que libera horário e duas requisições simultâneas para a mesma reserva.

Também foram verificados bloqueio de usuário já autenticado após desativação, proteção do próprio acesso administrativo, troca de senha, criação de usuários sem expor hashes e erros de JSON ou rota inexistente.

Os testes de interface usam respostas simuladas da API para avaliar renderização e interação: login, indicadores, formulário de paciente, dentistas, agenda, gestão de usuários, logout e restrições visuais do perfil dentista. A integração real com MySQL é coberta pela suíte separada. As capturas em screenshots mostram dados fictícios de demonstração.

## Escopo e pendências de instalação

- Preencher o .env com credenciais exclusivas e os dados do primeiro administrador.
- Repositório publicado: https://github.com/ssousa230890/OdontoAgenda. O primeiro commit enviado foi fe2bd18.
- Para acesso público, configurar domínio, HTTPS, backups e acesso da equipe.
- Uma instalação antiga com dados precisa de backup e planejamento da migração do esquema e da versão do MySQL. Nenhum volume existente foi renomeado, migrado ou apagado nesta entrega.
- A primeira execução de CI no GitHub passou: https://github.com/ssousa230890/OdontoAgenda/actions/runs/45322139247. Build, testes de navegador e integração com MySQL foram aprovados.

O Git local usa a branch main. O procedimento de publicação e a configuração de propriedade da pasta no Windows estão documentados em PUBLICAR.md.

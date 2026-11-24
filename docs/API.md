# API

No Docker, o prefixo público é /api. No desenvolvimento direto, use http://localhost:5000.

Envie JSON e o cabeçalho Authorization: Bearer TOKEN nas rotas protegidas.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | /health | Verifica conexão com o banco |
| POST | /auth/login | CPF e senha; retorna token e usuario |
| GET | /auth/me | Dados atuais do usuário autenticado |
| PUT | /auth/password | senhaAtual e novaSenha |
| GET | /users | Lista usuários, somente admin |
| POST | /users/register | Cria usuário, somente admin |
| PUT | /users/:id | Atualiza dados, perfil e ativo, somente admin |
| GET | /patients | Lista pacientes |
| GET | /patients/:id | Consulta paciente |
| POST | /patients | Cadastra paciente |
| PUT | /patients/:id | Atualiza paciente |
| DELETE | /patients/:id | Exclui paciente sem vínculos, somente admin |
| GET | /dentists | Lista dentistas |
| GET | /dentists/:id | Consulta dentista |
| POST | /dentists | Cadastra dentista, somente admin |
| PUT | /dentists/:id | Atualiza dentista, somente admin |
| DELETE | /dentists/:id | Exclui dentista sem vínculos, somente admin |
| GET | /appointments | Lista agenda com Patient e Dentist |
| POST | /appointments | Cria agendamento |
| PUT | /appointments/:id | Atualiza ou cancela agendamento |
| DELETE | /appointments/:id | Exclui agendamento, somente admin |

## Campos

Paciente: nomeCompleto, cpf, postoGraduacao e om obrigatórios. Opcionais: nomeGuerra, email, telefone, address, identidadeMilitar e dataNascimento (AAAA-MM-DD). CPF é normalizado e validado; vazio em email ou dataNascimento é armazenado como nulo.

Dentista: nome e cro obrigatórios; especialidade opcional. CRO deve ser único.

Usuário: nomeCompleto, nomeGuerra, postoGraduacao, identidadeMilitar, cpf, om e senha obrigatórios; email opcional; perfil admin, recepcionista ou dentista. A senha não é retornada pela API. Use ativo=false para bloquear acesso preservando o histórico.

Agendamento: patientId, dentistId e date obrigatórios; duration_minutes padrão 30; notes opcional, até 2000 caracteres; status agendado, concluido ou cancelado. A data deve incluir fuso, como 2026-12-01T10:00:00-03:00 ou 2026-12-01T13:00:00Z. O servidor registra createdById a partir da sessão. Não é possível sobrescrever autoria por meio do corpo da requisição.

## Respostas

Criação: 201. Consulta/edição: 200. Exclusão: 204, sem corpo.

Erros usam JSON com o campo error: 400 para entrada inválida, 401 para sessão ou credenciais inválidas, 403 para permissão insuficiente, 404 para recurso ausente, 409 para duplicidade, conflito de agenda ou cadastro vinculado e 429 para excesso de tentativas de login. Erros internos retornam mensagem genérica.

O limitador permite até 30 tentativas de login por combinação de endereço e CPF em 15 minutos. O sucesso limpa o contador dessa combinação. O estado fica na memória da instância.

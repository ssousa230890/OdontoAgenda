# Publicar no GitHub

O projeto usa a branch main. O destino desta publicação é https://github.com/ssousa230890/OdontoAgenda. As instruções abaixo também servem para publicar uma cópia em outro repositório.

1. Crie um repositório vazio na sua conta do GitHub. Não inicialize outro README ou licença no site, pois esses arquivos já existem aqui.
2. Na raiz do OdontoAgenda, confira os arquivos com git status. O .env, as dependências e o build devem permanecer ignorados.
3. Configure seu nome e e-mail de autoria no Git, caso ainda não estejam configurados.
4. Execute git add ., revise git diff --cached e crie o commit com git commit -m "Prepara OdontoAgenda Militar funcional".
5. Execute git remote add origin URL_DO_SEU_REPOSITORIO, substituindo o último argumento pela URL copiada do GitHub.
6. Execute git push -u origin main. A autenticação deve ser feita por seu gerenciador de credenciais ou chave SSH. Não inclua tokens de acesso em arquivos ou URLs de configuração.
7. Confira a aba Actions para acompanhar build e testes automatizados no GitHub.

## Propriedade da pasta no Windows

Nesta máquina, o Git identificou a pasta como pertencente ao grupo Administradores. Caso git status apresente "dubious ownership", registre apenas esta pasta como confiável no Git da sua conta:

    git config --global --add safe.directory C:/Users/ssous/Desktop/OdontoAgenda

A pasta foi registrada como confiável na configuração do Git desta máquina durante a preparação para publicação. Em outras máquinas, registre somente um diretório cuja origem você conhece. Para executar um comando sem persistir essa exceção, use:

    git -c safe.directory=C:/Users/ssous/Desktop/OdontoAgenda status

## Antes do primeiro envio

Revise os arquivos adicionados e confirme que não há dados reais de pacientes, dumps de banco ou credenciais. Os CPFs e as senhas que constam nas suítes são dados de teste e nunca são criados automaticamente na instalação normal.

Publicar o código no GitHub não coloca a aplicação no ar. A instalação segue as instruções do README; um ambiente público precisa de domínio, HTTPS e backup configurados.

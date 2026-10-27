# Spec Delta

## Purpose
Define quais imagens o servidor aceita, onde as guarda e como as nomeia, para que o envio de arquivos não permita escrever fora da pasta de uploads nem hospedar conteúdo executável.

## ADDED Requirements

### Requirement: Upload restrito a quem pode alterar a ficha
O envio de imagem SHALL exigir sessão e permissão de escrita na ficha informada: o usuário precisa ser o dono dela ou o GM. A ficha MUST existir.

#### Scenario: Sem sessão
- **WHEN** o upload é chamado sem sessão
- **THEN** a resposta é `401` e nenhum arquivo é gravado

#### Scenario: Ficha de outro jogador
- **WHEN** um jogador envia uma imagem para a ficha de outro jogador
- **THEN** a resposta é `403` e nenhum arquivo é gravado

#### Scenario: Ficha inexistente
- **WHEN** o identificador de ficha informado não existe
- **THEN** a resposta é `404` e nenhum arquivo é gravado

### Requirement: Somente imagens, verificadas pelo conteúdo
O sistema SHALL aceitar apenas imagens PNG, JPEG, WebP e GIF, identificadas pelo conteúdo do arquivo (assinatura inicial), e não pelo nome nem pelo tipo declarado pelo cliente. SVG, HTML e qualquer outro formato MUST ser recusados.

#### Scenario: Imagem válida
- **WHEN** um arquivo PNG verdadeiro é enviado por quem pode alterar a ficha
- **THEN** a resposta é `201` com o endereço da imagem

#### Scenario: Arquivo disfarçado
- **WHEN** um arquivo HTML ou SVG é enviado com nome `avatar.png` e tipo `image/png`
- **THEN** a resposta é `400` e nenhum arquivo é gravado

#### Scenario: Tipo não permitido
- **WHEN** um arquivo PDF, executável ou de texto é enviado
- **THEN** a resposta é `400`

### Requirement: Tamanho máximo
O sistema SHALL recusar arquivos maiores que 5 MB com `413`, sem gravá-los.

#### Scenario: Arquivo grande
- **WHEN** um arquivo de imagem com mais de 5 MB é enviado
- **THEN** a resposta é `413` e nenhum arquivo é gravado

### Requirement: Nome e caminho definidos pelo servidor
O nome do arquivo gravado SHALL ser gerado pelo servidor (identificador aleatório mais a extensão correspondente ao tipo detectado), ignorando o nome enviado. O caminho final MUST ficar sempre dentro da pasta de uploads, e o identificador da ficha usado no caminho MUST ser validado como o formato de identificador gerado pelo servidor.

#### Scenario: Identificador com travessia de caminho
- **WHEN** o identificador de ficha enviado contém `..`, barras ou qualquer caractere fora do formato de identificador
- **THEN** a resposta é `400` e nada é gravado fora da pasta de uploads

#### Scenario: Nome enviado é ignorado
- **WHEN** um PNG válido é enviado com o nome `../../evil.html`
- **THEN** o arquivo é gravado com nome gerado pelo servidor e extensão `.png`, dentro da pasta de uploads da ficha

#### Scenario: Endereço devolvido
- **WHEN** o upload é bem-sucedido
- **THEN** o endereço devolvido começa por `/uploads/<ficha>/` e aponta para o arquivo gravado

# Baleia Ninja Voadora

Extensão para Google Chrome que adiciona uma baleia animada às páginas, oferece
efeitos visuais e permite trocar a aparência da interface entre o modo padrão e
temas de times.

## Recursos atuais

- **Baleia animada:** aparece sobre as páginas compatíveis, se movimenta pela
  tela, rebate nas bordas.
- **Chuva de corações:** alterna a queda contínua de corações, nos temas de
  times usa os escudos correspondentes.
- **Contador da popup:** o botão “Clique aqui” incrementa um contador salvo na
  extensão e atualiza a barra de progresso, que chega a 100% em 500 cliques.
- **Contador global:** registra cliques esquerdo e direito nas páginas onde o
  script de conteúdo está ativo.
- **Temas:** modo padrão, Grêmio, Flamengo, Santos e São Paulo, o tema
  altera a aparência da popup e as imagens/efeitos da baleia e da chuva.
- **Persistência:** estados e contadores são guardados em
  `chrome.storage.local` e restaurados ao abrir a popup ou carregar uma página.
- **Link do GitHub:** o ícone do GitHub na popup abre a página do projeto.

## Códigos de tema

Abra as configurações (ícone de engrenagem) e digite um dos códigos.
O tema é aplicado assim que o código é reconhecido:

| Código | Resultado |
| --- | --- |
| `Gr&mio` | Ativa o tema Grêmio |
| `Fl@mengo` | Ativa o tema Flamengo |
| `S@ntos` | Ativa o tema Santos |
| `S@opaulo` | Ativa o tema São Paulo |
| `Padrao` | Restaura o modo padrão |

Os códigos diferenciam maiúsculas de minúsculas.

## Arquivos do projeto

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `manifest.json` | Configuração da extensão Manifest V3: popup, service worker, permissões, ícones e páginas onde o script de conteúdo pode ser executado. |
| `popup.html` | Estrutura da janela da extensão: contadores, botões, configurações e barra de progresso. |
| `popup.js` | Comportamento da popup: contadores, alternância da baleia e da chuva, aplicação de temas e sincronização com as páginas. |
| `styles.css` | Estilos da popup, estados de hover, temas, botões, barra de progresso e estilos preparados para um painel. |
| `content.js` | Código executado nas páginas: anima a baleia, gera a chuva de corações, conta cliques e recebe mensagens da popup. |
| `background.js` | Service worker da extensão. Inicializa dados na instalação e responde a mensagens de informação. |
| `panel.js` | Código de um painel alternativo de chuva de corações. Espera elementos com os IDs `heartRainButton` e `panelStatus`; não está conectado ao `manifest.json` atualmente. |
| `imagens/` | Imagens da baleia, dos times e do GitHub usadas pela extensão. |

### Comunicação entre os códigos

1. `popup.js` lê e grava as configurações em `chrome.storage.local`.
2. Para controlar efeitos ou temas, a popup envia mensagens às abas por meio
   de `chrome.tabs.sendMessage`.
3. `content.js` recebe essas mensagens e realiza a ação na página, ele também
   observa mudanças no armazenamento para manter as abas sincronizadas.
4. `background.js` executa como service worker e atende a inicialização e
   mensagens gerais da extensão.

O Manifest injeta `content.js` em páginas HTTP e HTTPS, páginas internas do
navegador, como `chrome://`, não aceitam esses scripts.

## Como instalar para desenvolvimento

1. Abra `chrome://extensions` no Chrome.
2. Ative **Modo do desenvolvedor**.
3. Selecione **Carregar sem compactação**.
4. Escolha a pasta raiz deste projeto, onde está o `manifest.json`.
5. Após alterar arquivos, use o botão de atualizar da extensão na página de
   extensões para recarregá-la.

## Próximas funções sugeridas

Estas ideias ainda **não estão implementadas**:

- [ ] Criar um minijogo para o botão 🎮 (definir regras, controles e condição de
  vitória antes da implementação).
- [ ] Definir ações para os dois botões atualmente vazios ou removê-los da
  interface.
- [ ] Adicionar opções para ajustar a velocidade da baleia e a intensidade da
  chuva de corações.
- [ ] Permitir pausar ou retomar os efeitos em uma aba específica.

## Tecnologias

- JavaScript
- HTML e CSS
- Chrome Extensions API (Manifest V3)

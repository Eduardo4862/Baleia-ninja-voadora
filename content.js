// Script que roda no contexto da página web.
// Responsável por criar a baleia interativa, aplicar a chuva de corações e registrar cliques globais.

console.log('Script de conteúdo carregado.');

let elementoBaleia = null;
let baleiaAtiva = false;
let modoGremioAtivo = false;
let modoFlamengoAtivo = false;
let posicaoX = 0;
let posicaoY = 0;
let velocidadeX = 0.9;
let velocidadeY = 0;
let escalaHorizontal = 1;

function resetarVelocidadeBaleia() {
    posicaoX = 0;
    posicaoY = 0;
    velocidadeX = 0.9;
    velocidadeY = 0;
    escalaHorizontal = 1;
    if (elementoBaleia) {
        elementoBaleia.style.left = `${posicaoX}px`;
        elementoBaleia.style.top = `${posicaoY}px`;
        elementoBaleia.style.transform = 'scaleX(1)';
    }
}
let idAnimacao = null;
let containerChuvaDeCoracoes = null;
let idIntervaloChuva = null;
let chuvaDeCoracoesAtiva = false;
let chuvaEmReinicializacao = false;
const raioBaleia = 15;
const velocidadeMaxima = 1.5;

/**
 * Atualiza o contador global de cliques na página.
 * Incrementa o contador armazenado no chrome.storage.local e registra no console.
 */
function atualizarCliquesGlobais() {
    chrome.storage.local.get(['cliquesGlobais'], function(resultado) {
        const cliquesGlobais = (resultado.cliquesGlobais || 0) + 1;
        chrome.storage.local.set({ cliquesGlobais: cliquesGlobais }, function() {
            console.log('Cliques globais atualizados:', cliquesGlobais);
        });
    });
}

/**
 * Registra cliques normais (esquerdo) na página.
 * Captura eventos de clique do documento e atualiza o contador global.
 */
document.addEventListener('click', function(evento) {
    atualizarCliquesGlobais();
}, true);

/**
 * Registra cliques com o botão direito (contexto) na página.
 * Captura eventos de clique direito do documento e atualiza o contador global.
 */
document.addEventListener('contextmenu', function(evento) {
    atualizarCliquesGlobais();
}, true);

/**
 * Inicializa a baleia quando o DOM está pronto.
 * Verifica se o document.body existe, carrega as configurações de armazenamento
 * e cria a baleia caso esteja ativa. Também inicia a chuva de corações se ativa.
 */
function inicializarBaleia() {
    if (document.body) {
        console.log('DOM pronto. A baleia pode ser criada.');
        chrome.storage.local.get(['baleiaAtiva', 'chuvaDeCoracoesAtiva', 'modoGremioAtivo', 'modoFlamengoAtivo'], function(resultado) {
            modoGremioAtivo = Boolean(resultado.modoGremioAtivo);
            modoFlamengoAtivo = Boolean(resultado.modoFlamengoAtivo);

            if (resultado.baleiaAtiva) {
                criarBaleia();
                baleiaAtiva = true;
                animarBaleia();
                console.log('Baleia ativada automaticamente.');
            }

            if (resultado.chuvaDeCoracoesAtiva) {
                iniciarChuvaDeCoracoes();
                console.log('Chuva de corações restaurada automaticamente.');
            }
        });
    } else {
        setTimeout(inicializarBaleia, 100);
    }
}

inicializarBaleia();

// ===== CHUVA DE CORAÇÕES =====
/**
 * Injeta os estilos CSS necessários para a animação da chuva de corações.
 * Define as keyframes e estilos dos elementos de coração que caem pela página.
 */
function injetarEstilosChuvaDeCoracoes() {
    if (document.getElementById('estilo-chuva-de-coracoes')) return;

    const estilo = document.createElement('style');
    estilo.id = 'estilo-chuva-de-coracoes';
    estilo.textContent = `
        #chuva-de-coracoes-extensao {
            position: fixed;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 2147483647;
            width: 100vw;
            height: 100vh;
        }

        #emoji-padrao-extensao {
            position: fixed;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 2147483646;
            width: 100vw;
            height: 100vh;
        }

        .emoji-padrao-item {
            position: absolute;
            top: -30px;
            display: inline-block;
            font-size: 24px;
            opacity: 0;
            user-select: none;
            animation: quedaEmojiPadrao linear forwards;
            text-shadow: 0 0 5px rgba(255, 30, 70, 0.22);
        }

        .gota-de-coracao {
            position: absolute;
            top: -40px;
            display: inline-block;
            font-size: 24px;
            color: #ff2d4d;
            text-shadow: 0 0 4px rgba(255, 45, 77, 0.22);
            animation: quedaDeCoracao linear forwards;
            will-change: transform, opacity;
            user-select: none;
        }

        .gota-de-coracao--imagem {
            width: 35px;
            height: 35px;
            object-fit: contain;
            filter: drop-shadow(0 0 2px rgba(255, 20, 60, 0.16));
        }

        @keyframes quedaDeCoracao {
            0% {
                transform: translate3d(0, 0, 0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            100% {
                transform: translate3d(var(--drift), 110vh, 0) rotate(360deg);
                opacity: 0;
            }
        }

    `;

    document.head.appendChild(estilo);
}

/**
 * Cria um único elemento de coração/emoji para a chuva de corações.
 * Define posição, tamanho, animação e tema (Grêmio, Flamengo ou padrão).
 * Remove o elemento após a animação terminar.
 */
function criarGotaDeCoracao() {
    if (!containerChuvaDeCoracoes) return;

    const temaAtivo = modoGremioAtivo ? 'gremio' : modoFlamengoAtivo ? 'flamengo' : 'padrao';
    const coracao = temaAtivo !== 'padrao' ? document.createElement('img') : document.createElement('span');
    coracao.className = 'gota-de-coracao' + (temaAtivo !== 'padrao' ? ' gota-de-coracao--imagem' : '');

    if (temaAtivo === 'gremio') {
        coracao.src = chrome.runtime.getURL('images/gremio.png');
        coracao.alt = 'Grêmio';
        coracao.style.filter = 'drop-shadow(0 0 3px rgba(30, 143, 255, 0.28))';
        const tamanhoAleatorio = 22 + Math.random() * 30;
        coracao.style.width = `${tamanhoAleatorio}px`;
        coracao.style.height = `${tamanhoAleatorio}px`;
    } else if (temaAtivo === 'flamengo') {
        coracao.src = chrome.runtime.getURL('images/flamengo.png');
        coracao.alt = 'Flamengo';
        coracao.style.filter = 'drop-shadow(0 0 3px rgba(255, 45, 77, 0.28))';
        const tamanhoAleatorio = 22 + Math.random() * 30;
        coracao.style.width = `${tamanhoAleatorio}px`;
        coracao.style.height = `${tamanhoAleatorio}px`;
    } else {
        coracao.textContent = '💖';
        coracao.style.filter = 'drop-shadow(0 0 2px rgba(255, 45, 77, 0.18))';
    }

    const esquerda = Math.random() * window.innerWidth;
    const deriva = (Math.random() - 0.5) * 220;
    const tamanho = 18 + Math.random() * 18;
    const duracao = 4 + Math.random() * 3;

    coracao.style.left = `${esquerda}px`;
    coracao.style.fontSize = `${tamanho}px`;
    coracao.style.setProperty('--drift', `${deriva}px`);
    coracao.style.animationDuration = `${duracao}s`;
    coracao.style.animationDelay = '0s';

    containerChuvaDeCoracoes.appendChild(coracao);

    setTimeout(() => coracao.remove(), (duracao + 0.3) * 1000);
}

/**
 * Inicia a animação de chuva de corações na página.
 * Cria o container, injeta estilos e gera corações continuamente a cada 140ms.
 * Atualiza o armazenamento local para refletir o estado ativo.
 */
function iniciarChuvaDeCoracoes() {
    if (chuvaDeCoracoesAtiva) return;

    // Garante que qualquer container anterior seja removido e todas as gotas limpas.
    const containerAnterior = document.getElementById('chuva-de-coracoes-extensao');
    if (containerAnterior) {
        containerAnterior.remove();
    }
    const todasAsGotas = document.querySelectorAll('.gota-de-coracao');
    todasAsGotas.forEach(gota => gota.remove());

    injetarEstilosChuvaDeCoracoes();

    containerChuvaDeCoracoes = document.createElement('div');
    containerChuvaDeCoracoes.id = 'chuva-de-coracoes-extensao';
    containerChuvaDeCoracoes.setAttribute('aria-hidden', 'true');

    const raiz = document.documentElement || document.body;
    if (raiz) {
        raiz.appendChild(containerChuvaDeCoracoes);
    }

    for (let indice = 0; indice < 18; indice++) {
        criarGotaDeCoracao();
    }

    idIntervaloChuva = setInterval(criarGotaDeCoracao, 140);
    chuvaDeCoracoesAtiva = true;
    chrome.storage.local.set({ chuvaDeCoracoesAtiva: true });
}

/**
 * Para a animação de chuva de corações e remove o container da página.
 * Para o intervalo de criação de gotas, remove o container e todas as gotas do DOM.
 * Atualiza o armazenamento local para refletir o estado inativo.
 */
function pararChuvaDeCoracoes() {
    // Para imediatamente o intervalo de criação de gotas.
    if (idIntervaloChuva) {
        clearInterval(idIntervaloChuva);
        idIntervaloChuva = null;
    }

    chuvaDeCoracoesAtiva = false;

    // Remove o container principal e todas as gotas existentes.
    const containerPrincipal = document.getElementById('chuva-de-coracoes-extensao');
    if (containerPrincipal) {
        containerPrincipal.remove();
    }

    if (containerChuvaDeCoracoes) {
        containerChuvaDeCoracoes = null;
    }

    // Remove qualquer gota de coração órfã que possa ter ficado no DOM.
    const todasAsGotas = document.querySelectorAll('.gota-de-coracao');
    todasAsGotas.forEach(gota => {
        if (gota.parentNode) {
            gota.parentNode.removeChild(gota);
        }
    });

    chrome.storage.local.set({ chuvaDeCoracoesAtiva: false });
}

/**
 * Reinicia a chuva imediatamente quando o tema muda.
 * Esse fluxo usa o estado vivo da página e bloqueia reinicializações em paralelo
 * para evitar o efeito de piscar e não cair quando há múltiplas abas ou trocas rápidas.
 */
function reaplicarChuvaSeAtiva() {
    if (!chuvaDeCoracoesAtiva || chuvaEmReinicializacao) return;

    chuvaEmReinicializacao = true;

    if (idIntervaloChuva) {
        clearInterval(idIntervaloChuva);
        idIntervaloChuva = null;
    }

    const containerPrincipal = document.getElementById('chuva-de-coracoes-extensao');
    if (containerPrincipal) {
        containerPrincipal.remove();
    }

    const gotasRestantes = document.querySelectorAll('.gota-de-coracao');
    gotasRestantes.forEach(gota => {
        if (gota.parentNode) {
            gota.parentNode.removeChild(gota);
        }
    });

    chuvaDeCoracoesAtiva = false;
    iniciarChuvaDeCoracoes();
    chuvaEmReinicializacao = false;
}

/**
 * Define o tema Grêmio como ativo ou inativo.
 * Desativa o tema Flamengo automaticamente, atualiza a imagem da baleia
 * e reinicia a chuva de corações se ativa para refletir as cores do tema.
 * @param {boolean} ativo - Se true, ativa o tema Grêmio; se false, desativa.
 */
function definirTemaGremio(ativo) {
    const ativar = Boolean(ativo);

    if (ativar) {
        modoGremioAtivo = true;
        modoFlamengoAtivo = false;
    } else {
        modoGremioAtivo = false;
        if (!modoFlamengoAtivo) {
            modoFlamengoAtivo = false;
        }
    }

    chrome.storage.local.set({
        modoGremioAtivo: modoGremioAtivo,
        modoFlamengoAtivo: modoFlamengoAtivo
    });

    if (elementoBaleia) {
        elementoBaleia.src = chrome.runtime.getURL(
            modoGremioAtivo ? 'images/baleiaminigremio.png' : modoFlamengoAtivo ? 'images/baleiaminiflamengo.png' : 'images/baleiamini.png'
        );
    }

    reaplicarChuvaSeAtiva();
}

/**
 * Define o tema Flamengo como ativo ou inativo.
 * Desativa o tema Grêmio automaticamente, atualiza a imagem da baleia
 * e reinicia a chuva de corações se ativa para refletir as cores do tema.
 * @param {boolean} ativo - Se true, ativa o tema Flamengo; se false, desativa.
 */
function definirTemaFlamengo(ativo) {
    const ativar = Boolean(ativo);

    if (ativar) {
        modoFlamengoAtivo = true;
        modoGremioAtivo = false;
    } else {
        modoFlamengoAtivo = false;
        if (!modoGremioAtivo) {
            modoGremioAtivo = false;
        }
    }

    chrome.storage.local.set({
        modoGremioAtivo: modoGremioAtivo,
        modoFlamengoAtivo: modoFlamengoAtivo
    });

    if (elementoBaleia) {
        elementoBaleia.src = chrome.runtime.getURL(
            modoGremioAtivo ? 'images/baleiaminigremio.png' : modoFlamengoAtivo ? 'images/baleiaminiflamengo.png' : 'images/baleiamini.png'
        );
    }

    reaplicarChuvaSeAtiva();
}

/**
 * Cria o elemento da baleia na página.
 * Adiciona a imagem da baleia ao DOM com posicionamento fixo e estilos apropriados.
 * Escolhe a imagem correta de acordo com o tema ativo (Grêmio, Flamengo ou padrão).
 */
function criarBaleia() {
    if (elementoBaleia) return;
    if (!document.body) return;

    posicaoX = 0;
    posicaoY = 0;

    elementoBaleia = document.createElement('img');
    elementoBaleia.id = 'baleia-extensao';
    elementoBaleia.src = chrome.runtime.getURL(
        modoGremioAtivo ? 'images/baleiaminigremio.png' : modoFlamengoAtivo ? 'images/baleiaminiflamengo.png' : 'images/baleiamini.png'
    );
    resetarVelocidadeBaleia();

    elementoBaleia.style.cssText = `
        position: fixed;
        max-width: 76px;
        max-height: 76px;
        width: auto;
        height: auto;
        top: ${posicaoY}px;
        left: ${posicaoX}px;
        z-index: 999999;
        pointer-events: none;
        cursor: default;
        transform: scaleX(1);
    `;

    document.body.appendChild(elementoBaleia);
    console.log('Baleia criada na página.');
}

/**
 * Cria um efeito visual de pulso quando a baleia colide com a borda da tela.
 * Gera um gradiente radial na cor do tema que expande e desaparece em 0.55 segundos.
 * @param {number} x - Coordenada X do impacto.
 * @param {number} y - Coordenada Y do impacto.
 */
function criarEfeitoDeColisao(x, y) {
    const efeito = document.createElement('div');
    const cor = modoGremioAtivo ? '#1f8fff' : '#ff2d4d';
    const corSecundaria = modoGremioAtivo ? '#0d4ea8' : '#8b001d';
    efeito.style.cssText = `
        position: fixed;
        width: 44px;
        height: 44px;
        background: radial-gradient(circle, ${cor}, ${corSecundaria}, transparent);
        border-radius: 50%;
        top: ${y - 22}px;
        left: ${x - 22}px;
        z-index: 999998;
        pointer-events: none;
        animation: impactoPulse 0.55s ease-out;
    `;

    // Adiciona a animação de impacto.
    const estilo = document.createElement('style');
    if (!document.getElementById('animacao-impacto')) {
        estilo.id = 'animacao-impacto';
        estilo.textContent = `
            @keyframes impactoPulse {
                0% {
                    transform: scale(0.7);
                    opacity: 1;
                }
                100% {
                    transform: scale(2.2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(estilo);
    }

    document.body.appendChild(efeito);
    setTimeout(() => efeito.remove(), 550);
}

/**
 * Anima a baleia, movendo-a pela página usando requestAnimationFrame.
 * Detecta colisões com as bordas da tela, causa rebote, inverte a escala horizontal
 * e gera efeitos visuais de impacto. Limita a velocidade máxima para evitar movimento excessivo.
 */
function animarBaleia() {
    if (!baleiaAtiva || !elementoBaleia) return;

    if (Math.abs(velocidadeX) < 0.15) {
        velocidadeX = 0.8 * (Math.random() > 0.5 ? 1 : -1);
    }

    if (Math.abs(velocidadeY) < 0.15) {
        velocidadeY = 0.8 * (Math.random() > 0.5 ? 1 : -1);
    }

    posicaoX += velocidadeX;
    posicaoY += velocidadeY;

    if (posicaoX <= 0 || posicaoX >= window.innerWidth - 30) {
        velocidadeX *= -1.05;
        velocidadeY += (Math.random() - 0.5) * 0.55;
        posicaoX = Math.max(0, Math.min(posicaoX, window.innerWidth - 30));
        criarEfeitoDeColisao(posicaoX + 15, posicaoY + 15);
    }

    if (posicaoY <= 0 || posicaoY >= window.innerHeight - 30) {
        velocidadeY *= -1.05;
        velocidadeX += (Math.random() - 0.5) * 0.55;
        posicaoY = Math.max(0, Math.min(posicaoY, window.innerHeight - 30));
        criarEfeitoDeColisao(posicaoX + 15, posicaoY + 15);
    }

    const velocidade = Math.sqrt(velocidadeX ** 2 + velocidadeY ** 2);
    if (velocidade > velocidadeMaxima) {
        velocidadeX = (velocidadeX / velocidade) * velocidadeMaxima;
        velocidadeY = (velocidadeY / velocidade) * velocidadeMaxima;
    }

    escalaHorizontal = velocidadeX >= 0 ? 1 : -1;

    elementoBaleia.style.left = posicaoX + 'px';
    elementoBaleia.style.top = posicaoY + 'px';
    elementoBaleia.style.transform = `scaleX(${escalaHorizontal})`;

    idAnimacao = requestAnimationFrame(animarBaleia);
}

/**
 * Remove a baleia do DOM e cancela o loop de animação.
 * Limpa o elemento e o ID do requestAnimationFrame.
 */
function removerBaleia() {
    if (elementoBaleia) {
        elementoBaleia.remove();
        elementoBaleia = null;
    }
    if (idAnimacao) {
        cancelAnimationFrame(idAnimacao);
        idAnimacao = null;
    }
}

/**
 * Listener para mudanças no armazenamento local da extensão.
 * Atualiza a baleia, chuva de corações e temas quando o armazenamento muda em outras abas.
 * Sincroniza o estado entre múltiplas páginas abertas.
 */
chrome.storage.onChanged.addListener(function(mudancas, area) {
    if (area !== 'local') return;

    if ('modoGremioAtivo' in mudancas || 'modoFlamengoAtivo' in mudancas) {
        const novoGremio = Object.prototype.hasOwnProperty.call(mudancas, 'modoGremioAtivo')
            ? Boolean(mudancas.modoGremioAtivo.newValue)
            : modoGremioAtivo;

        const novoFlamengo = Object.prototype.hasOwnProperty.call(mudancas, 'modoFlamengoAtivo')
            ? Boolean(mudancas.modoFlamengoAtivo.newValue)
            : modoFlamengoAtivo;

        if (novoGremio && novoFlamengo) {
            modoGremioAtivo = true;
            modoFlamengoAtivo = false;
        } else if (novoGremio) {
            modoGremioAtivo = true;
            modoFlamengoAtivo = false;
        } else if (novoFlamengo) {
            modoGremioAtivo = false;
            modoFlamengoAtivo = true;
        } else {
            modoGremioAtivo = false;
            modoFlamengoAtivo = false;
        }

        if (elementoBaleia) {
            elementoBaleia.src = chrome.runtime.getURL(
                modoGremioAtivo ? 'images/baleiaminigremio.png' : modoFlamengoAtivo ? 'images/baleiaminiflamengo.png' : 'images/baleiamini.png'
            );
        }

        reaplicarChuvaSeAtiva();
    }

    if ('baleiaAtiva' in mudancas) {
        const deveEstarAtiva = Boolean(mudancas.baleiaAtiva.newValue);

        if (deveEstarAtiva && !baleiaAtiva) {
            criarBaleia();
            baleiaAtiva = true;
            animarBaleia();
        } else if (!deveEstarAtiva && baleiaAtiva) {
            baleiaAtiva = false;
            removerBaleia();
        }
    }

    if ('chuvaDeCoracoesAtiva' in mudancas) {
        if (chuvaEmReinicializacao) return;

        const deveEstarAtiva = Boolean(mudancas.chuvaDeCoracoesAtiva.newValue);

        if (deveEstarAtiva && !chuvaDeCoracoesAtiva) {
            iniciarChuvaDeCoracoes();
        } else if (!deveEstarAtiva && chuvaDeCoracoesAtiva) {
            pararChuvaDeCoracoes();
        }
    }
});

/**
 * Listener para mensagens vindas do popup ou do painel.
 * Processa ações como ativar/desativar baleia, chuva de corações e temas.
 * Envia respostas com o status das operações realizadas.
 */
chrome.runtime.onMessage.addListener(function(solicitacao, remetente, enviarResposta) {
    if (solicitacao.action === 'ativarBaleia') {
        if (!baleiaAtiva) {
            criarBaleia();
            baleiaAtiva = true;
            animarBaleia();
            chrome.storage.local.set({ baleiaAtiva: true });
            enviarResposta({ status: 'ativado' });
        } else {
            baleiaAtiva = false;
            removerBaleia();
            chrome.storage.local.set({ baleiaAtiva: false });
            enviarResposta({ status: 'desativado' });
        }
    } else if (solicitacao.action === 'alternarChuvaDeCoracoes') {
        if (!chuvaDeCoracoesAtiva) {
            iniciarChuvaDeCoracoes();
            enviarResposta({ status: 'iniciado' });
        } else {
            pararChuvaDeCoracoes();
            enviarResposta({ status: 'parado' });
        }
    } else if (solicitacao.action === 'atualizarTema') {
        const novoGremio = Boolean(solicitacao.modoGremioAtivo);
        const novoFlamengo = Boolean(solicitacao.modoFlamengoAtivo);

        if (novoGremio) {
            modoGremioAtivo = true;
            modoFlamengoAtivo = false;
        } else if (novoFlamengo) {
            modoGremioAtivo = false;
            modoFlamengoAtivo = true;
        } else {
            modoGremioAtivo = false;
            modoFlamengoAtivo = false;
        }

        if (elementoBaleia) {
            elementoBaleia.src = chrome.runtime.getURL(
                modoGremioAtivo ? 'images/baleiaminigremio.png' : modoFlamengoAtivo ? 'images/baleiaminiflamengo.png' : 'images/baleiamini.png'
            );
        }

        reaplicarChuvaSeAtiva();
        enviarResposta({ status: 'temaAtualizado', ativo: modoGremioAtivo || modoFlamengoAtivo });
    } else if (solicitacao.action === 'definirTemaGremio') {
        definirTemaGremio(solicitacao.ativo);
        enviarResposta({ status: 'temaAtualizado', ativo: modoGremioAtivo });
    } else if (solicitacao.action === 'definirTemaFlamengo') {
        definirTemaFlamengo(solicitacao.ativo);
        enviarResposta({ status: 'temaAtualizado', ativo: modoFlamengoAtivo });
    }
});

/**
 * Notifica o service worker que a página foi carregada.
 * Envia a URL da página carregada para possíveis registros ou ações futuras.
 */
chrome.runtime.sendMessage(
    { action: 'paginaCarregada', url: window.location.href },
    function(resposta) {
        if (resposta) {
            console.log('Resposta do script de fundo:', resposta);
        }
    }
);

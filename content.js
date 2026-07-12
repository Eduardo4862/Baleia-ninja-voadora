// Script que roda no contexto da página web.
// Responsável por criar a baleia interativa, aplicar a chuva de corações e registrar cliques globais.

console.log('Script de conteúdo carregado.');

let elementoBaleia = null;
let baleiaAtiva = false;
let modoGremioAtivo = false;
let posicaoX = 100;
let posicaoY = 100;
let velocidadeX = 0.8;
let velocidadeY = 0.8;
let escalaHorizontal = 1;
let idAnimacao = null;
let containerChuvaDeCoracoes = null;
let idIntervaloChuva = null;
let chuvaDeCoracoesAtiva = false;
const raioBaleia = 15;
const velocidadeMaxima = 1.5;

// Função utilitária para registrar cliques globais na página.
function atualizarCliquesGlobais() {
    chrome.storage.local.get(['cliquesGlobais'], function(resultado) {
        const cliquesGlobais = (resultado.cliquesGlobais || 0) + 1;
        chrome.storage.local.set({ cliquesGlobais: cliquesGlobais }, function() {
            console.log('Cliques globais atualizados:', cliquesGlobais);
        });
    });
}

// Registra cliques normais na página.
document.addEventListener('click', function(evento) {
    atualizarCliquesGlobais();
}, true);

// Registra cliques com o botão direito também.
document.addEventListener('contextmenu', function(evento) {
    atualizarCliquesGlobais();
}, true);

// Espera o DOM ficar pronto para criar a baleia.
function inicializarBaleia() {
    if (document.body) {
        console.log('DOM pronto. A baleia pode ser criada.');
        chrome.storage.local.get(['baleiaAtiva', 'modoGremioAtivo'], function(resultado) {
            if (resultado.baleiaAtiva) {
                modoGremioAtivo = Boolean(resultado.modoGremioAtivo);
                criarBaleia();
                baleiaAtiva = true;
                animarBaleia();
                console.log('Baleia ativada automaticamente.');
            } else {
                modoGremioAtivo = Boolean(resultado.modoGremioAtivo);
            }
        });
    } else {
        setTimeout(inicializarBaleia, 100);
    }
}

inicializarBaleia();

// ===== CHUVA DE CORAÇÕES =====
// Injeta os estilos da animação da chuva de corações.
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

        .gota-de-coracao {
            position: absolute;
            top: -40px;
            display: inline-block;
            font-size: 24px;
            color: #ff5d8f;
            text-shadow: 0 0 8px rgba(255, 93, 143, 0.35);
            animation: quedaDeCoracao linear forwards;
            will-change: transform, opacity;
            user-select: none;
        }

        .gota-de-coracao--imagem {
            width: 35px;
            height: 35px;
            object-fit: contain;
            filter: drop-shadow(0 0 6px rgba(13, 94, 166, 0.35));
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

// Cria uma única gota de coração para a chuva.
function criarGotaDeCoracao() {
    if (!containerChuvaDeCoracoes) return;

    const coracao = modoGremioAtivo ? document.createElement('img') : document.createElement('span');
    coracao.className = 'gota-de-coracao' + (modoGremioAtivo ? ' gota-de-coracao--imagem' : '');

    if (modoGremioAtivo) {
        coracao.src = chrome.runtime.getURL('images/gremio.png');
        coracao.alt = 'Grêmio';
        const tamanhoAleatorio = 22 + Math.random() * 30;
        coracao.style.width = `${tamanhoAleatorio}px`;
        coracao.style.height = `${tamanhoAleatorio}px`;
    } else {
        coracao.textContent = '💖';
    }

    const esquerda = Math.random() * window.innerWidth;
    const deriva = (Math.random() - 0.5) * 220;
    const tamanho = 18 + Math.random() * 18;
    const duracao = 4 + Math.random() * 3;
    const atraso = Math.random() * 0.8;

    coracao.style.left = `${esquerda}px`;
    coracao.style.fontSize = `${tamanho}px`;
    coracao.style.setProperty('--drift', `${deriva}px`);
    coracao.style.animationDuration = `${duracao}s`;
    coracao.style.animationDelay = `${atraso}s`;

    containerChuvaDeCoracoes.appendChild(coracao);

    setTimeout(() => coracao.remove(), (duracao + atraso + 0.3) * 1000);
}

// Inicia a chuva de corações na página.
function iniciarChuvaDeCoracoes() {
    if (chuvaDeCoracoesAtiva) return;

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
}

// Para a chuva de corações e remove o container da página.
function pararChuvaDeCoracoes() {
    if (idIntervaloChuva) {
        clearInterval(idIntervaloChuva);
        idIntervaloChuva = null;
    }

    if (containerChuvaDeCoracoes) {
        containerChuvaDeCoracoes.remove();
        containerChuvaDeCoracoes = null;
    }

    chuvaDeCoracoesAtiva = false;
}

// Cria e estiliza a baleia na tela.
function definirTemaGremio(ativo) {
    modoGremioAtivo = Boolean(ativo);

    if (elementoBaleia) {
        elementoBaleia.src = chrome.runtime.getURL(
            modoGremioAtivo ? 'images/baleiaminigremio.png' : 'images/baleiamini.png'
        );
    }

    if (chuvaDeCoracoesAtiva) {
        pararChuvaDeCoracoes();
        iniciarChuvaDeCoracoes();
    }
}

function criarBaleia() {
    if (elementoBaleia) return;
    if (!document.body) return;

    elementoBaleia = document.createElement('img');
    elementoBaleia.id = 'baleia-extensao';
    elementoBaleia.src = chrome.runtime.getURL(
        modoGremioAtivo ? 'images/baleiaminigremio.png' : 'images/baleiamini.png'
    );
    elementoBaleia.style.cssText = `
        position: fixed;
        max-width: 76px;
        max-height: 76px;
        width: auto;
        height: auto;
        top: ${posicaoY}px;
        left: ${posicaoX}px;
        z-index: 999999;
        pointer-events: auto;
        cursor: grab;
    `;

    document.body.appendChild(elementoBaleia);
    console.log('Baleia criada na página.');
}

// Cria um efeito visual ao bater nas bordas da tela.
function criarEfeitoDeColisao(x, y) {
    const efeito = document.createElement('div');
    const cor = modoGremioAtivo ? 'rgba(13, 94, 166, 0.85)' : 'rgba(255, 0, 0, 0.8)';
    const corSecundaria = modoGremioAtivo ? 'rgba(0, 191, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)';
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

    // Adiciona a animação de impacto somente uma vez.
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

// Anima o movimento da baleia pela tela.
function animarBaleia() {
    if (!baleiaAtiva || !elementoBaleia) return;

    // Atualiza a posição da baleia.
    posicaoX += velocidadeX;
    posicaoY += velocidadeY;

    // Verifica colisão com as bordas e faz a baleia rebotar.
    if (posicaoX <= 0 || posicaoX >= window.innerWidth - 30) {
        velocidadeX *= -1.05;
        escalaHorizontal *= -1; // Inverte a imagem horizontalmente.
        posicaoX = Math.max(0, Math.min(posicaoX, window.innerWidth - 30));

        criarEfeitoDeColisao(posicaoX + 15, posicaoY + 15);
    }

    if (posicaoY <= 0 || posicaoY >= window.innerHeight - 30) {
        velocidadeY *= -1.05;
        posicaoY = Math.max(0, Math.min(posicaoY, window.innerHeight - 30));

        criarEfeitoDeColisao(posicaoX + 15, posicaoY + 15);
    }

    // Limita a velocidade máxima da baleia.
    const velocidade = Math.sqrt(velocidadeX ** 2 + velocidadeY ** 2);
    if (velocidade > velocidadeMaxima) {
        velocidadeX = (velocidadeX / velocidade) * velocidadeMaxima;
        velocidadeY = (velocidadeY / velocidade) * velocidadeMaxima;
    }

    elementoBaleia.style.left = posicaoX + 'px';
    elementoBaleia.style.top = posicaoY + 'px';
    elementoBaleia.style.transform = `scaleX(${escalaHorizontal})`;

    idAnimacao = requestAnimationFrame(animarBaleia);
}

// Remove a baleia da tela e cancela a animação.
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

// Adiciona a interação de arrastar a baleia com o cursor.
document.addEventListener('mousedown', function(evento) {
    if (elementoBaleia && evento.target === elementoBaleia && baleiaAtiva) {
        let estaArrastando = true;

        function aoMoverMouse(eventoMovimento) {
            if (!estaArrastando) return;

            posicaoX = eventoMovimento.clientX - 15;
            posicaoY = eventoMovimento.clientY - 15;

            // Mantém a baleia dentro dos limites da tela.
            posicaoX = Math.max(0, Math.min(posicaoX, window.innerWidth - 30));
            posicaoY = Math.max(0, Math.min(posicaoY, window.innerHeight - 30));

            elementoBaleia.style.left = posicaoX + 'px';
            elementoBaleia.style.top = posicaoY + 'px';
        }

        function aoSoltarMouse() {
            estaArrastando = false;
            document.removeEventListener('mousemove', aoMoverMouse);
            document.removeEventListener('mouseup', aoSoltarMouse);

            // Dá um impulso aleatório ao soltar a baleia.
            const anguloAleatorio = Math.random() * Math.PI * 2;
            velocidadeX = Math.cos(anguloAleatorio) * 8;
            velocidadeY = Math.sin(anguloAleatorio) * 8;
        }

        document.addEventListener('mousemove', aoMoverMouse);
        document.addEventListener('mouseup', aoSoltarMouse);
    }
});

// Escuta mensagens vindas do popup ou do painel.
chrome.runtime.onMessage.addListener(function(solicitacao, remetente, enviarResposta) {
    if (solicitacao.action === 'ativarBaleia') {
        if (!baleiaAtiva) {
            criarBaleia();
            baleiaAtiva = true;
            animarBaleia();
            enviarResposta({ status: 'ativado' });
        } else {
            baleiaAtiva = false;
            removerBaleia();
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
    } else if (solicitacao.action === 'definirTemaGremio') {
        definirTemaGremio(solicitacao.ativo);
        enviarResposta({ status: 'temaAtualizado', ativo: modoGremioAtivo });
    }
});

// Envia uma mensagem para o service worker informando que a página foi carregada.
chrome.runtime.sendMessage(
    { action: 'paginaCarregada', url: window.location.href },
    function(resposta) {
        if (resposta) {
            console.log('Resposta do script de fundo:', resposta);
        }
    }
);

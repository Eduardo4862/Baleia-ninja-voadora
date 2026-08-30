/**
 * Event listener para quando a popup é carregada (DOMContentLoaded).
 * Inicializa todos os elementos da interface, carrega dados do armazenamento
 * e configura os listeners de eventos dos botões.
 */
document.addEventListener('DOMContentLoaded', function () {
    const elementoStatus = document.getElementById('status');
    const botaoClique = document.getElementById('botaoContador');
    const botaoCoracoes = document.getElementById('botaoCoracoes');
    const botaoBaleia = document.getElementById('botaoBaleia');
    const elementoResultado = document.getElementById('resultado');
    const elementoTextoCliques = document.getElementById('textoContador');
    const elementoCliquesGlobais = document.getElementById('contadorGlobal');
    const elementoBarraProgresso = document.getElementById('preenchimentoProgresso');
    const botaoConfiguracoes = document.getElementById('botaoConfiguracoes');
    const painelConfiguracoes = document.getElementById('painelConfiguracoes');
    const campoCodigo = document.getElementById('campoCodigo');
    let baleiaAtiva = false;
    let modoGremioAtivo = false;
    let modoFlamengoAtivo = false;
    let chuvaDeCoracoesAtiva = false;

    /**
     * Atualiza o texto e a imagem do botão da baleia para refletir o tema ativo.
     * Muda a imagem de acordo com o modo (Grêmio, Flamengo ou padrão)
     * e o estado (ativada ou desativada).
     * @param {boolean} estaAtiva - Se true, o botão mostra "Desativar Baleia"; caso contrário, "Ativar Baleia".
     */
    function definirTextoDoBotaoBaleia(estaAtiva) {
        const imagem = modoGremioAtivo
            ? 'baleiaminigremio.png'
            : modoFlamengoAtivo
                ? 'baleiaminiflamengo.png'
                : 'baleiamini.png';
        const texto = estaAtiva ? 'Desativar Baleia' : 'Ativar Baleia';
        const alt = modoGremioAtivo ? 'Baleia Grêmio' : modoFlamengoAtivo ? 'Baleia Flamengo' : 'Baleia';
        botaoBaleia.innerHTML = `<img src="images/${imagem}" alt="${alt}" class="button-icon"> ${texto}`;
    }

    /**
     * Envia uma ação de tema para todas as abas compatíveis.
     * Filtra abas com URLs suportadas (exclui chrome://, about:, etc.)
     * e envia uma mensagem com a ação e o valor do tema.
     * @param {string} acao - O tipo de ação a enviar (ex: 'definirTemaGremio').
     * @param {boolean} valor - O valor da ação (true para ativar, false para desativar).
     */
    function enviarTemaParaAbas(acao, valor) {
        chrome.tabs.query({}, function (abas) {
            abas.forEach(function (aba) {
                if (!aba || !aba.id || !aba.url) return;

                const url = aba.url.toLowerCase();
                const eAbaNaoCompativel = /^(chrome:|edge:|about:|devtools:|moz-extension:)/.test(url);
                if (eAbaNaoCompativel) return;

                chrome.tabs.sendMessage(aba.id, { action: acao, ativo: valor });
            });
        });
    }

    /**
     * Envia o tema Grêmio para todas as abas compatíveis.
     * @param {boolean} temaAtivo - Se true, ativa o tema Grêmio; se false, desativa.
     */
    function enviarTemaGremioParaPagina(temaAtivo) {
        enviarTemaParaAbas('definirTemaGremio', temaAtivo);
    }

    /**
     * Envia o estado completo do tema para todas as abas compatíveis.
     * Isso evita que duas mensagens concorrentes (Grêmio e Flamengo) se sobrescrevam.
     */
    function enviarTemaCompletoParaPagina() {
        chrome.tabs.query({}, function (abas) {
            abas.forEach(function (aba) {
                if (!aba || !aba.id || !aba.url) return;

                const url = aba.url.toLowerCase();
                const eAbaNaoCompativel = /^(chrome:|edge:|about:|devtools:|moz-extension:)/.test(url);
                if (eAbaNaoCompativel) return;

                chrome.tabs.sendMessage(aba.id, {
                    action: 'atualizarTema',
                    modoGremioAtivo: modoGremioAtivo,
                    modoFlamengoAtivo: modoFlamengoAtivo
                });
            });
        });
    }

    /**
     * Envia o tema Flamengo para todas as abas compatíveis.
     * @param {boolean} temaAtivo - Se true, ativa o tema Flamengo; se false, desativa.
     */
    function enviarTemaFlamengoParaPagina(temaAtivo) {
        enviarTemaParaAbas('definirTemaFlamengo', temaAtivo);
    }

    /**
     * Atualiza a aparência visual da popup de acordo com o tema ativo.
     * Aplica classes CSS ao corpo da popup e atualiza o ícone do botão de corações.
     */
    function atualizarTemaVisual() {
        document.body.classList.toggle('theme-gremio', modoGremioAtivo);
        document.body.classList.toggle('theme-flamengo', modoFlamengoAtivo);
        document.body.classList.toggle('theme-padrao', !modoGremioAtivo && !modoFlamengoAtivo);

        if (modoGremioAtivo) {
            botaoCoracoes.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon">';
        } else if (modoFlamengoAtivo) {
            botaoCoracoes.innerHTML = '<img src="images/flamengo.png" alt="Flamengo" class="button-icon">';
        } else {
            botaoCoracoes.textContent = '💖';
        }
    }

    /**
     * Aplica o tema Grêmio e sincroniza o estado em todas as abas compatíveis.
     * Desativa o tema Flamengo automaticamente e atualiza a interface visual.
     * @param {boolean} temaAtivo - Se true, ativa o tema Grêmio; se false, desativa.
     */
    function aplicarTemaGremio(temaAtivo) {
        const ativar = Boolean(temaAtivo);

        if (ativar) {
            modoGremioAtivo = true;
            modoFlamengoAtivo = false;
        } else {
            modoGremioAtivo = false;
            modoFlamengoAtivo = false;
        }

        atualizarTemaVisual();
        definirTextoDoBotaoBaleia(baleiaAtiva);
        chrome.storage.local.set({ modoGremioAtivo: modoGremioAtivo, modoFlamengoAtivo: modoFlamengoAtivo });
        enviarTemaCompletoParaPagina();
    }

    /**
     * Aplica o tema Flamengo e sincroniza o estado em todas as abas compatíveis.
     * Desativa o tema Grêmio automaticamente e atualiza a interface visual.
     * @param {boolean} temaAtivo - Se true, ativa o tema Flamengo; se false, desativa.
     */
    function aplicarTemaFlamengo(temaAtivo) {
        const ativar = Boolean(temaAtivo);

        if (ativar) {
            modoFlamengoAtivo = true;
            modoGremioAtivo = false;
        } else {
            modoFlamengoAtivo = false;
            modoGremioAtivo = false;
        }

        atualizarTemaVisual();
        definirTextoDoBotaoBaleia(baleiaAtiva);
        chrome.storage.local.set({ modoGremioAtivo: modoGremioAtivo, modoFlamengoAtivo: modoFlamengoAtivo });
        enviarTemaCompletoParaPagina();
    }

    /**
     * Atualiza a barra de progresso de acordo com o contador de cliques.
     * Calcula o percentual em relação ao máximo (5000 cliques) e atualiza o visual.
     * @param {number} contador - O valor atual do contador de cliques.
     */
    function atualizarBarraDeProgresso(contador) {
        const maximoDeCliques = 5000;
        const percentual = Math.min((contador / maximoDeCliques) * 100, 100);
        elementoBarraProgresso.style.width = percentual + '%';
        elementoTextoCliques.textContent = `${contador} cliques`;
    }

    /**
     * Carrega os dados salvos no armazenamento local da extensão ao iniciar a popup.
     * Restaura contador, cliques globais, estado da baleia e temas ativos.
     */
    chrome.storage.local.get(['contador', 'cliquesGlobais', 'baleiaAtiva', 'modoGremioAtivo', 'modoFlamengoAtivo', 'chuvaDeCoracoesAtiva'], function (resultado) {
        const contador = resultado.contador || 0;
        const cliquesGlobais = resultado.cliquesGlobais || 0;
        baleiaAtiva = Boolean(resultado.baleiaAtiva);
        modoGremioAtivo = Boolean(resultado.modoGremioAtivo);
        modoFlamengoAtivo = Boolean(resultado.modoFlamengoAtivo);
        chuvaDeCoracoesAtiva = Boolean(resultado.chuvaDeCoracoesAtiva);
        elementoCliquesGlobais.textContent = `Cliques globais: ${cliquesGlobais}`;
        atualizarBarraDeProgresso(contador);
        atualizarTemaVisual();
        definirTextoDoBotaoBaleia(baleiaAtiva);
    });

    chrome.storage.onChanged.addListener(function (mudancas) {
        const proximoGremio = Object.prototype.hasOwnProperty.call(mudancas, 'modoGremioAtivo')
            ? Boolean(mudancas.modoGremioAtivo.newValue)
            : modoGremioAtivo;

        const proximoFlamengo = Object.prototype.hasOwnProperty.call(mudancas, 'modoFlamengoAtivo')
            ? Boolean(mudancas.modoFlamengoAtivo.newValue)
            : modoFlamengoAtivo;

        if ('modoGremioAtivo' in mudancas || 'modoFlamengoAtivo' in mudancas) {
            if (proximoGremio && proximoFlamengo) {
                modoGremioAtivo = true;
                modoFlamengoAtivo = false;
            } else if (proximoGremio) {
                modoGremioAtivo = true;
                modoFlamengoAtivo = false;
            } else if (proximoFlamengo) {
                modoGremioAtivo = false;
                modoFlamengoAtivo = true;
            } else {
                modoGremioAtivo = false;
                modoFlamengoAtivo = false;
            }

            atualizarTemaVisual();
            definirTextoDoBotaoBaleia(baleiaAtiva);
        }

        if ('chuvaDeCoracoesAtiva' in mudancas) {
            chuvaDeCoracoesAtiva = Boolean(mudancas.chuvaDeCoracoesAtiva.newValue);
            atualizarTemaVisual();
        }
    });

    /**
     * Atualiza o contador global a cada segundo.
     * Lê o valor atual do armazenamento e exibe na interface da popup.
     */
    setInterval(function () {
        chrome.storage.local.get(['cliquesGlobais'], function (resultado) {
            const cliquesGlobais = resultado.cliquesGlobais || 0;
            elementoCliquesGlobais.textContent = `Cliques globais: ${cliquesGlobais}`;
        });
    }, 1000);

    /**
     * Verifica se o código digitado está correto e aplica o tema correspondente.
     * Códigos disponíveis: 'Gr&mio' (Grêmio), 'Fl@mengo' (Flamengo), 'Ninja' (padrão).
     * Fecha o painel de configuração após reconhecer um código válido.
     */
    function verificarSenhaEFecharPainel() {
        const textoDigitado = campoCodigo.value.trim();
        const senhaGremio = 'Gr&mio';
        const senhaPadrao = 'Ninja';
        const senhaFlamengo = 'Fl@mengo';

        if (textoDigitado === senhaGremio) {
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaGremio(true);
            elementoResultado.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Modo Grêmio ativado!';
        } else if (textoDigitado === senhaFlamengo) {
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaFlamengo(true);
            elementoResultado.innerHTML = '<img src="images/flamengo.png" alt="Flamengo" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Modo Flamengo ativado!';
        } else if (textoDigitado === senhaPadrao) {
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaGremio(false);
            aplicarTemaFlamengo(false);
            elementoResultado.textContent = 'Modo padrão restaurado.';
        }
    }

    /**
     * Event listener para o botão de contagem de cliques.
     * Incrementa o contador e exibe a mensagem de atualização.
     */
    botaoClique.addEventListener('click', function () {
        chrome.storage.local.get(['contador'], function (resultado) {
            const contador = (resultado.contador || 0) + 1;
            chrome.storage.local.set({ contador: contador });
            elementoResultado.textContent = `Você clicou ${contador} vezes!`;
            atualizarBarraDeProgresso(contador);
        });
    });

    /**
     * Event listener para o botão de chuva de corações.
     * Alterna entre ativar e desativar a chuva de corações em todas as abas.
     * Atualiza a mensagem de status de acordo com o resultado.
     */
    botaoCoracoes.addEventListener('click', function () {
        chrome.tabs.query({}, function (abas) {
            abas.forEach(function (aba) {
                if (!aba || !aba.id) return;

                chrome.tabs.sendMessage(aba.id, { action: 'alternarChuvaDeCoracoes' }, function (resposta) {
                    if (chrome.runtime.lastError) return;

                    if (resposta && resposta.status === 'iniciado') {
                        chuvaDeCoracoesAtiva = true;
                        chrome.storage.local.set({ chuvaDeCoracoesAtiva: true });
                        atualizarTemaVisual();
                        if (modoGremioAtivo) {
                            elementoResultado.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Grêmio ativada!';
                        } else if (modoFlamengoAtivo) {
                            elementoResultado.innerHTML = '<img src="images/flamengo.png" alt="Flamengo" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Flamengo ativada!';
                        } else {
                            elementoResultado.textContent = '💖 Chuva de corações ativada!';
                        }
                    } else if (resposta && resposta.status === 'parado') {
                        chuvaDeCoracoesAtiva = false;
                        chrome.storage.local.set({ chuvaDeCoracoesAtiva: false });
                        atualizarTemaVisual();
                        if (modoGremioAtivo) {
                            elementoResultado.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Grêmio desativada!';
                        } else if (modoFlamengoAtivo) {
                            elementoResultado.innerHTML = '<img src="images/flamengo.png" alt="Flamengo" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Flamengo desativada!';
                        } else {
                            elementoResultado.textContent = '💖 Chuva de corações desativada!';
                        }
                    } else {
                        if (modoGremioAtivo) {
                            elementoResultado.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Efeito de Grêmio aplicado!';
                        } else if (modoFlamengoAtivo) {
                            elementoResultado.innerHTML = '<img src="images/flamengo.png" alt="Flamengo" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Efeito de Flamengo aplicado!';
                        } else {
                            elementoResultado.textContent = '💖 Efeito aplicado!';
                        }
                    }
                });
            });
        });
    });

    /**
     * Event listener para o botão da baleia.
     * Alterna entre ativar e desativar a baleia em todas as abas.
     * Atualiza o texto do botão e a mensagem de status de acordo com o resultado.
     */
    botaoBaleia.addEventListener('click', function () {
        chrome.tabs.query({}, function (abas) {
            abas.forEach(function (aba) {
                if (!aba || !aba.id) return;

                chrome.tabs.sendMessage(aba.id, { action: 'ativarBaleia' }, function (resposta) {
                    if (chrome.runtime.lastError) return;

                    if (resposta && resposta.status === 'ativado') {
                        elementoResultado.textContent = '🐋 Baleia ativada!';
                        baleiaAtiva = true;
                        chrome.storage.local.set({ baleiaAtiva: true });
                        atualizarTemaVisual();
                        definirTextoDoBotaoBaleia(true);
                    } else if (resposta && resposta.status === 'desativado') {
                        elementoResultado.textContent = '🐋 Baleia desativada!';
                        baleiaAtiva = false;
                        chrome.storage.local.set({ baleiaAtiva: false });
                        atualizarTemaVisual();
                        definirTextoDoBotaoBaleia(false);
                    }
                });
            });
        });
    });

    /**
     * Event listener para o botão de configurações.
     * Alterna a visibilidade do painel de entrada de código de tema.
     */
    if (botaoConfiguracoes && painelConfiguracoes) {
        botaoConfiguracoes.addEventListener('click', function () {
            painelConfiguracoes.classList.toggle('hidden');
        });
    }
    /**
     * Event listener para o campo de código de tema.
     * Verifica o código digitado em tempo real e aplica o tema se válido.
     */
    campoCodigo.addEventListener('input', verificarSenhaEFecharPainel);
});

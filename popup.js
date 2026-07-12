// Quando a popup for carregada, inicializa os elementos da interface e as ações dos botões.
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

    function definirTextoDoBotaoBaleia(estaAtiva) {
        const imagem = modoGremioAtivo ? 'baleiaminigremio.png' : 'baleiamini.png';
        const texto = estaAtiva ? 'Desativar Baleia' : 'Ativar Baleia';
        const alt = modoGremioAtivo ? 'Baleia Grêmio' : 'Baleia';
        botaoBaleia.innerHTML = `<img src="images/${imagem}" alt="${alt}" class="button-icon"> ${texto}`;
    }

    function enviarTemaGremioParaPagina(temaAtivo) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (abas) {
            if (abas[0] && abas[0].id) {
                chrome.tabs.sendMessage(abas[0].id, { action: 'definirTemaGremio', ativo: temaAtivo });
            }
        });
    }

    function aplicarTemaGremio(temaAtivo) {
        modoGremioAtivo = temaAtivo;
        const temaGremio = modoGremioAtivo ? 'gremio' : 'padrao';
        document.body.classList.toggle('theme-gremio', modoGremioAtivo);
        document.body.classList.toggle('theme-padrao', !modoGremioAtivo);

        if (modoGremioAtivo) {
            botaoCoracoes.innerHTML = '<img src="images/gremio.png" alt="Grêmio" class="button-icon">';
        } else {
            botaoCoracoes.innerHTML = '💖';
        }
        definirTextoDoBotaoBaleia(baleiaAtiva);
        enviarTemaGremioParaPagina(modoGremioAtivo);
    }

    function atualizarBarraDeProgresso(contador) {
        const maximoDeCliques = 5000;
        const percentual = Math.min((contador / maximoDeCliques) * 100, 100);
        elementoBarraProgresso.style.width = percentual + '%';
        elementoTextoCliques.textContent = `${contador} cliques`;
    }

    // Carrega os dados salvos no armazenamento local da extensão.
    chrome.storage.local.get(['contador', 'cliquesGlobais', 'baleiaAtiva', 'modoGremioAtivo'], function (resultado) {
        const contador = resultado.contador || 0;
        const cliquesGlobais = resultado.cliquesGlobais || 0;
        baleiaAtiva = Boolean(resultado.baleiaAtiva);
        modoGremioAtivo = Boolean(resultado.modoGremioAtivo);
        elementoCliquesGlobais.textContent = `Cliques globais: ${cliquesGlobais}`;
        atualizarBarraDeProgresso(contador);
        aplicarTemaGremio(modoGremioAtivo);
    });

    // Atualiza o contador global a cada segundo.
    setInterval(function () {
        chrome.storage.local.get(['cliquesGlobais'], function (resultado) {
            const cliquesGlobais = resultado.cliquesGlobais || 0;
            elementoCliquesGlobais.textContent = `Cliques globais: ${cliquesGlobais}`;
        });
    }, 1000);

    function verificarSenhaEFecharPainel() {
        const textoDigitado = campoCodigo.value.trim();
        const senhaGremio = 'Gr&mio';
        const senhaPadrao = 'Ninja';
        const senhaFlamengo = 'Fl@mengo';

        if (textoDigitado === senhaGremio) {
            modoGremioAtivo = true;
            chrome.storage.local.set({ modoGremioAtivo: true });
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaGremio(true);
        } else if (textoDigitado === senhaFlamengo) {
            modoGremioAtivo = false;
            chrome.storage.local.set({ modoGremioAtivo: false });
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaGremio(false);
            elementoResultado.textContent = '🔜 Funcionalidade do Flamengo ainda será implementada.';
        } else if (textoDigitado === senhaPadrao) {
            modoGremioAtivo = false;
            chrome.storage.local.set({ modoGremioAtivo: false });
            painelConfiguracoes.classList.add('hidden');
            campoCodigo.value = '';
            aplicarTemaGremio(false);
        }
    }

    // Ação do botão de contagem de cliques.
    botaoClique.addEventListener('click', function () {
        chrome.storage.local.get(['contador'], function (resultado) {
            const contador = (resultado.contador || 0) + 1;
            chrome.storage.local.set({ contador: contador });
            elementoResultado.textContent = `Você clicou ${contador} vezes!`;
            atualizarBarraDeProgresso(contador);
        });
    });

    // Ativa ou desativa a chuva de corações na página atual.
    botaoCoracoes.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (abas) {
            chrome.tabs.sendMessage(abas[0].id, { action: 'alternarChuvaDeCoracoes' }, function (resposta) {
                if (resposta && resposta.status === 'iniciado') {
                    elementoResultado.innerHTML = modoGremioAtivo
                        ? '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Grêmio ativada!'
                        : '💖 Chuva de corações ativada!';
                } else if (resposta && resposta.status === 'parado') {
                    elementoResultado.innerHTML = modoGremioAtivo
                        ? '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Chuva de Grêmio desativada!'
                        : '💖 Chuva de corações desativada!';
                } else {
                    elementoResultado.innerHTML = modoGremioAtivo
                        ? '<img src="images/gremio.png" alt="Grêmio" class="button-icon" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> Efeito de Grêmio aplicado!'
                        : '💖 Efeito aplicado!';
                }
            });
        });
    });

    // Ativa ou desativa a baleia na página atual.
    botaoBaleia.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (abas) {
            chrome.tabs.sendMessage(abas[0].id, { action: 'ativarBaleia' }, function (resposta) {
                if (resposta && resposta.status === 'ativado') {
                    elementoResultado.textContent = '🐋 Baleia ativada!';
                    baleiaAtiva = true;
                    chrome.storage.local.set({ baleiaAtiva: true });
                    aplicarTemaGremio(modoGremioAtivo);
                } else if (resposta && resposta.status === 'desativado') {
                    elementoResultado.textContent = '🐋 Baleia desativada!';
                    baleiaAtiva = false;
                    chrome.storage.local.set({ baleiaAtiva: false });
                    aplicarTemaGremio(modoGremioAtivo);
                }
            });
        });
    });

   // Mostra ou esconde a caixa de texto de configurações.
    if (botaoConfiguracoes && painelConfiguracoes) {
        botaoConfiguracoes.addEventListener('click', function () {
            painelConfiguracoes.classList.toggle('hidden');
        });
    }
    // Fecha o painel quando a senha correta for digitada.
    campoCodigo.addEventListener('input', verificarSenhaEFecharPainel);
});

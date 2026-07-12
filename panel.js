// Quando o painel for carregado, ele associa a ação do botão à troca do efeito na aba atual.
document.addEventListener('DOMContentLoaded', function () {
    const botaoChuvaDeCoracoes = document.getElementById('heartRainButton');
    const estadoDoPainel = document.getElementById('panelStatus');

    if (!botaoChuvaDeCoracoes || !estadoDoPainel) return;

    botaoChuvaDeCoracoes.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (abas) {
            const idAba = abas[0]?.id;
            if (!idAba) {
                estadoDoPainel.textContent = 'Nenhuma aba ativa foi encontrada.';
                return;
            }

            chrome.tabs.sendMessage(idAba, { action: 'alternarChuvaDeCoracoes' }, function (resposta) {
                if (chrome.runtime.lastError) {
                    estadoDoPainel.textContent = 'Não foi possível aplicar o efeito nesta página.';
                    return;
                }

                if (resposta?.status === 'iniciado') {
                    estadoDoPainel.textContent = 'Chuva de corações ativada!';
                } else if (resposta?.status === 'parado') {
                    estadoDoPainel.textContent = 'Chuva de corações desativada.';
                } else {
                    estadoDoPainel.textContent = 'Efeito aplicado.';
                }
            });
        });
    });
});

/**
 * Event listener para quando o painel é carregado (DOMContentLoaded).
 * Inicializa o painel com o botão de chuva de corações funcional.
 * Envia mensagens para a aba ativa para alternar o efeito de chuva de corações.
 */
document.addEventListener('DOMContentLoaded', function () {
    const botaoChuvaDeCoracoes = document.getElementById('heartRainButton');
    const estadoDoPainel = document.getElementById('panelStatus');

    if (!botaoChuvaDeCoracoes || !estadoDoPainel) return;

    /**
     * Event listener para o botão de chuva de corações no painel.
     * Envia uma mensagem para a aba ativa alternar o efeito de chuva de corações.
     * Atualiza o status do painel com a resposta recebida.
     */
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

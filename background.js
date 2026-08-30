// ============================================
// Worker de serviço da extensão Chrome
// ============================================
// Responsável por inicializar dados e responder a mensagens vindas do conteúdo da página, popup e painel.

/**
 * Listener para o evento de instalação/atualização da extensão.
 * Inicializa o contador de cliques com valor padrão (0) quando a extensão é instalada.
 * Registra mensagens de log quando a extensão é atualizada.
 */
chrome.runtime.onInstalled.addListener(function(detalhes) {
    if (detalhes.reason === 'install') {
        console.log('Extensão instalada com sucesso.');
        // Inicializa o contador de cliques com um valor padrão.
        chrome.storage.local.set({ contador: 0 });
    } else if (detalhes.reason === 'update') {
        console.log('Extensão atualizada com sucesso.');
    }
});

/**
 * Listener para mensagens enviadas por outros scripts da extensão (content.js, popup.js, panel.js).
 * Processa solicitações de informações sobre a página e envia respostas correspondentes.
 */
chrome.runtime.onMessage.addListener(function(solicitacao, remetente, enviarResposta) {
    if (solicitacao.action === 'obterInformacoesDaPagina') {
        enviarResposta({ info: 'A extensão está funcionando corretamente.' });
    }
});

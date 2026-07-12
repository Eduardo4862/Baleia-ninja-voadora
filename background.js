// Worker de serviço da extensão Chrome.
// Responsável por inicializar dados e responder a mensagens vindas do conteúdo da página, popup e painel.

chrome.runtime.onInstalled.addListener(function(detales) {
    if (detales.reason === 'install') {
        console.log('Extensão instalada com sucesso.');
        // Inicializa o contador de cliques com um valor padrão.
        chrome.storage.local.set({ contador: 0 });
    } else if (detales.reason === 'update') {
        console.log('Extensão atualizada com sucesso.');
    }
});

// Escuta mensagens enviadas por outros scripts da extensão.
chrome.runtime.onMessage.addListener(function(solicitacao, remetente, enviarResposta) {
    if (solicitacao.action === 'obterInformacoesDaPagina') {
        enviarResposta({ info: 'A extensão está funcionando corretamente.' });
    }
});

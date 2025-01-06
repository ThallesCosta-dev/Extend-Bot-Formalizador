chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensão instalada');
});

// Gerencia mensagens entre componentes da extensão
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONFIG_UPDATED') {
    chrome.tabs.query({url: 'https://web.whatsapp.com/*'}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  }
  return true;
}); 
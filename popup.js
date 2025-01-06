document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const formalityLevel = document.getElementById('formalityLevel');
  const saveButton = document.getElementById('saveButton');
  const status = document.getElementById('status');

  // Carrega configurações salvas
  chrome.storage.sync.get(['apiKey', 'formalityLevel'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.formalityLevel) {
      formalityLevel.value = result.formalityLevel;
    }
  });

  // Salva configurações
  saveButton.addEventListener('click', () => {
    const config = {
      apiKey: apiKeyInput.value.trim(),
      formalityLevel: formalityLevel.value
    };

    // Verifica se a chave API foi fornecida
    if (!config.apiKey) {
      status.textContent = 'Por favor, insira uma chave API válida!';
      status.className = 'status error';
      status.style.display = 'block';
      return;
    }

    chrome.storage.sync.set(config, () => {
      // Notifica a content script sobre a atualização
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'CONFIG_UPDATED',
            config: config
          });
        }
      });

      status.textContent = 'Configurações salvas com sucesso!';
      status.className = 'status success';
      status.style.display = 'block';

      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    });
  });
}); 
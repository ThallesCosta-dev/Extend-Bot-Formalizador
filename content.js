let config = {
  formalityLevel: 'light'
};

// Adicione este trecho após a declaração inicial do config
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONFIG_UPDATED') {
    config = message.config;
    console.log('Configurações atualizadas:', config);
  }
});

// Carrega configurações
chrome.storage.sync.get(['apiKey', 'formalityLevel'], (result) => {
  config = { ...config, ...result };
});

// Adiciona CSS diretamente ao documento
const style = document.createElement('style');
style.textContent = `
  .format-ai-button {
    background: none !important;
    border: none !important;
    padding: 0 8px !important;
    cursor: pointer !important;
    color: #54656f !important;
    height: 40px !important;
    width: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .format-ai-button:hover {
    background-color: rgba(0, 0, 0, 0.05) !important;
    border-radius: 4px !important;
  }
  .format-ai-button:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  .formality-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    display: none;
  }
  .formality-modal.active {
    display: block;
  }
  .formality-option {
    display: block;
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
  .formality-option:hover {
    background-color: #f5f5f5;
  }
`;
document.head.appendChild(style);

function createButton() {
  const button = document.createElement('button');
  button.className = 'format-ai-button x972fbf xcfux6l x1qhh985 xm0m39n x78zum5 x6s0dn4 xl56j7k x1k74hu9 x1lcm9me x1yr5g0i xrt01vj x10y3i5r x1y1aw1k x1sxyh0 xwib8y2 xurb0ha x1ypdohk xxymvpz xfs2ol5 xw4jnvo x1qx5ct2 x1afcbsf xgguqb4';
  button.title = 'Formalizar texto (AI)';
  button.innerHTML = `
    <span aria-hidden="true" data-icon="format" class="">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14ZM7 17h10v-2H7v2Zm0-4h10v-2H7v2Zm0-4h10V7H7v2ZM5 19V5v14Z"/>
      </svg>
    </span>
  `;
  button.onclick = async function() {
    const messageSpan = document.evaluate(
      "//span[@data-lexical-text='true']",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    
    if (!messageSpan) {
      alert('Campo de mensagem não encontrado');
      return;
    }

    const texto = messageSpan.textContent || '';

    if (!texto || texto.trim().length === 0) {
      alert('Digite uma mensagem primeiro');
      return;
    }

    this.disabled = true;
    this.innerHTML = '⌛ Processando...';
    
    try {
      const textoFormal = await formalizarTexto(texto.trim());
      console.log('Texto original:', texto);
      console.log('Texto formalizado:', textoFormal);
      
      // Modifica diretamente o nó de texto dentro do span
      const textNode = messageSpan.firstChild;
      if (textNode) {
        textNode.nodeValue = textoFormal;
      } else {
        messageSpan.textContent = textoFormal;
      }

      // Força atualização do DOM
      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });
      messageSpan.dispatchEvent(event);

    } catch (error) {
      console.error('Erro completo:', error);
      alert('Erro ao formalizar texto. Por favor, tente novamente.');
    } finally {
      this.disabled = false;
      this.innerHTML = `
        <span aria-hidden="true" data-icon="format" class="">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14ZM7 17h10v-2H7v2Zm0-4h10v-2H7v2Zm0-4h10V7H7v2ZM5 19V5v14Z"/>
          </svg>
        </span>
      `;
    }
  };
  
  // Adicione o evento de clique direito (contextmenu)
  button.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const modal = document.querySelector('.formality-modal') || createFormalityModal();
    modal.classList.add('active');
  });

  return button;
}

function addButton() {
  if (document.querySelector('.format-ai-button')) return;
  
  // Procura a barra de formatação do WhatsApp
  const formatBar = document.querySelector('div[class*="x78zum5"][class*="x1op4030"]');
  if (!formatBar) return;
  
  const button = createButton();
  formatBar.appendChild(button);
}

// Múltiplas formas de garantir que o botão seja adicionado
document.addEventListener('DOMContentLoaded', addButton);
window.addEventListener('load', addButton);

// Aumenta a frequência da verificação
setInterval(addButton, 500); // Reduzido de 1000 para 500ms

// Melhora a configuração do observer
const observer = new MutationObserver(() => {
  if (!document.querySelector('.format-ai-button')) {
    addButton();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true // Adiciona observação de mudanças de atributos
});

async function formalizarTexto(texto) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `INSTRUÇÕES ESTRITAS:
            - Receba o texto e retorne APENAS o texto formalizado, escreva de maneira humanizada, descontraída e sem parecer robótico ou distante.
            - Você deve APENAS reformular o texto para um tom mais formal em português
            - Não acrescente nada além do texto formalizado
            - Mantenha os sinais de pontuação originais (especialmente "?")
            - Preserve a natureza da frase (se é pergunta, afirmação, exclamação)
            - Se a mensagem não tiver ponto, inclua um ponto final.
            - NÃO adicione NENHUM comentário, descrição ou explicação
            - NÃO use frases como "versão formal:", "aqui está:", etc
            - NÃO adicione títulos ou rótulos
            - NÃO use comentários ou marcadores
            - APENAS retorne o texto formalizado, nada mais
            - Mantenha o texto direto e conciso
            - Preserve o sentido original da mensagem

            
            EXEMPLO INCORRETO:
            "Aqui está a versão formal: [texto]"
            
            EXEMPLO CORRETO:
            [apenas o texto formalizado]`
          },
          {
            role: "user",
            content: texto
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API:', errorData);
      throw new Error(`Erro da API: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('Resposta da API:', data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Resposta inválida da API');
    }

    // Remove QUALQUER tipo de prefixo ou comentário
    let textoFormal = data.choices[0].message.content.trim();
    
    // Remove todos os tipos possíveis de prefixos e comentários
    textoFormal = textoFormal
      .replace(/^[//#\-*>]+\s*/gm, '') // Remove marcadores de comentário
      .replace(/^["']|["']$/g, '') // Remove aspas no início e fim
      .replace(/^(aqui|segue|este é|esta é|versão|exemplo|texto|resposta|formal|informal).*?:/is, '') // Remove introduções
      .replace(/^.*?(formal|informal|profissional|melhor).*?:\s*/im, '') // Remove descrições
      .replace(/^\s*\[|\]\s*$/g, '') // Remove colchetes
      .replace(/^\s*\{|\}\s*$/g, '') // Remove chaves
      .trim();

    return textoFormal;
  } catch (error) {
    console.error('Erro detalhado:', error);
    throw new Error(`Erro ao formalizar: ${error.message}`);
  }
} 

// Adicione a função para criar o modal
function createFormalityModal() {
  const modal = document.createElement('div');
  modal.className = 'formality-modal';
  modal.innerHTML = `
    <h3>Nível de Formalidade</h3>
    <button class="formality-option" data-level="light">Leve</button>
    <button class="formality-option" data-level="medium">Médio</button>
    <button class="formality-option" data-level="high">Máximo</button>
  `;

  document.body.appendChild(modal);

  // Adiciona eventos aos botões
  modal.querySelectorAll('.formality-option').forEach(button => {
    button.addEventListener('click', () => {
      config.formalityLevel = button.dataset.level;
      chrome.storage.sync.set({ formalityLevel: config.formalityLevel });
      modal.classList.remove('active');
    });
  });

  return modal;
}
import { WidgetApiClient } from './api/client';
import { getAnonymousId } from './utils/anonymousId';
import type { WidgetConfig, Message } from './types';

export class ChatWidget {
  private apiClient: WidgetApiClient;
  private anonymousId: string;
  private config: WidgetConfig;
  private isOpen: boolean = false;
  
  // Elementos DOM
  private bubble: HTMLElement | null = null;
  private chatWindow: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private messageInput: HTMLInputElement | null = null;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.apiClient = new WidgetApiClient(config.apiUrl, config.embedKey);
    this.anonymousId = getAnonymousId();
    
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Aplicar cores customizadas
      this.applyCustomStyles();
      
      // Criar elementos DOM
      this.createBubble();
      this.createChatWindow();
      
      // Carregar histórico
      await this.loadHistory();
      
    } catch (error) {
      console.error('Erro ao inicializar widget:', error);
    }
  }

  private applyCustomStyles(): void {
    const root = document.documentElement;
    if (this.config.primaryColor) {
      root.style.setProperty('--primary-color', this.config.primaryColor);
    }
    if (this.config.secondaryColor) {
      root.style.setProperty('--secondary-color', this.config.secondaryColor);
    }
  }

  private createBubble(): void {
    this.bubble = document.createElement('button');
    this.bubble.className = 'octop-bubble';
    this.bubble.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM7 9H17C17.55 9 18 9.45 18 10C18 10.55 17.55 11 17 11H7C6.45 11 6 10.55 6 10C6 9.45 6.45 9 7 9ZM13 14H7C6.45 14 6 13.55 6 13C6 12.45 6.45 12 7 12H13C13.55 12 14 12.45 14 13C14 13.55 13.55 14 13 14ZM17 8H7C6.45 8 6 7.55 6 7C6 6.45 6.45 6 7 6H17C17.55 6 18 6.45 18 7C18 7.55 17.55 8 17 8Z" fill="white"/>
      </svg>
    `;
    this.bubble.onclick = () => this.toggleChat();
    document.body.appendChild(this.bubble);
  }

  private createChatWindow(): void {
    // Criar estrutura da janela de chat
    this.chatWindow = document.createElement('div');
    this.chatWindow.className = 'octop-chat-window octop-widget';
    this.chatWindow.style.display = 'none';
    
    this.chatWindow.innerHTML = `
      <div class="octop-chat-header">
        <div class="octop-chat-header-info">
          ${this.config.avatarUrl ? `<img src="${this.config.avatarUrl}" class="octop-chat-avatar" alt="Avatar">` : ''}
          <div class="octop-chat-header-text">
            <div class="octop-chat-title">${this.config.title || 'Chat'}</div>
            <div class="octop-chat-subtitle">${this.config.subtitle || 'Online agora'}</div>
          </div>
        </div>
        <button class="octop-chat-close" aria-label="Fechar chat">×</button>
      </div>
      <div class="octop-chat-messages"></div>
      <div class="octop-chat-input-container">
        <form class="octop-chat-input-form">
          <input 
            type="text" 
            class="octop-chat-input" 
            placeholder="Digite sua mensagem..."
            aria-label="Digite sua mensagem"
            autocomplete="off"
            required
          >
          <button type="submit" class="octop-chat-send-btn" aria-label="Enviar mensagem">▶</button>
        </form>
      </div>
    `;

    document.body.appendChild(this.chatWindow);

    // Bind eventos
    const closeBtn = this.chatWindow.querySelector('.octop-chat-close');
    closeBtn?.addEventListener('click', () => this.toggleChat());

    const form = this.chatWindow.querySelector('.octop-chat-input-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    this.messagesContainer = this.chatWindow.querySelector('.octop-chat-messages');
    this.messageInput = this.chatWindow.querySelector('.octop-chat-input') as HTMLInputElement;
  }

  private toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.chatWindow) {
      this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
    }
    if (this.isOpen && this.messageInput) {
      this.messageInput.focus();
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    if (!this.messageInput || !this.messageInput.value.trim()) return;

    const content = this.messageInput.value.trim();
    this.messageInput.value = '';

    try {
      // Adicionar mensagem do usuário
      this.addMessage({
        id: Date.now().toString(),
        text: content,
        author: 'contact',
        sendAt: new Date().toISOString(),
      });

      // Mostrar loading
      this.showLoading();

      // Enviar para API
      const response = await this.apiClient.sendMessage(content, this.anonymousId);

      console.log('Resposta da API:', response); // DEBUG
      console.log('agentResponse:', response.agentResponse); // DEBUG

      // Remover loading
      this.hideLoading();

      // Verificar se agentResponse existe
      if (!response.agentResponse) {
        console.error('agentResponse não encontrado na resposta:', response);
        this.showError('Erro: resposta do agente inválida.');
        return;
      }

      // Adicionar resposta do agente
      this.addMessage(response.agentResponse);

    } catch (error) {
      this.hideLoading();
      console.error('Erro ao enviar mensagem:', error);
      this.showError('Erro ao enviar mensagem. Tente novamente.');
    }
  }

  private addMessage(message: Message): void {
    if (!this.messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `octop-message ${message.author}`;
    
    const time = new Date(message.sendAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    messageEl.innerHTML = `
      ${message.author === 'agent' && this.config.avatarUrl 
        ? `<img src="${this.config.avatarUrl}" class="octop-message-avatar" alt="Avatar">`
        : ''
      }
      <div class="octop-message-content">
        <div class="octop-message-bubble">${this.escapeHtml(message.text)}</div>
        <div class="octop-message-time">${time}</div>
      </div>
    `;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  private async loadHistory(): Promise<void> {
    try {
      const history = await this.apiClient.getHistory(this.anonymousId);
      
      if (history && history.length > 0) {
        history.forEach((conv) => {
          this.addMessage(conv.userMessage);
          this.addMessage(conv.agentResponse);
        });
      } else if (this.config.welcomeMessage) {
        // Adicionar mensagem de boas-vindas
        this.addMessage({
          id: 'welcome',
          text: this.config.welcomeMessage,
          author: 'agent',
          sendAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  private showLoading(): void {
    if (!this.messagesContainer) return;

    const loadingEl = document.createElement('div');
    loadingEl.className = 'octop-message agent octop-loading-message';
    loadingEl.innerHTML = `
      ${this.config.avatarUrl 
        ? `<img src="${this.config.avatarUrl}" class="octop-message-avatar" alt="Avatar">`
        : ''
      }
      <div class="octop-loading">
        <div class="octop-loading-dot"></div>
        <div class="octop-loading-dot"></div>
        <div class="octop-loading-dot"></div>
      </div>
    `;

    this.messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }

  private hideLoading(): void {
    const loadingEl = this.messagesContainer?.querySelector('.octop-loading-message');
    loadingEl?.remove();
  }

  private showError(message: string): void {
    this.addMessage({
      id: Date.now().toString(),
      text: message,
      author: 'agent',
      sendAt: new Date().toISOString(),
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

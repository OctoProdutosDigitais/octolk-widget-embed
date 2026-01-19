# Guia de Criação do Projeto Widget Embed

## 📋 Visão Geral

Este documento descreve o passo a passo para criar o projeto **standalone** do widget de chat embedável. Este projeto é **completamente separado** do frontend Next.js principal e será construído com Vanilla JavaScript/TypeScript usando Vite.

## 🎯 Por que Separado?

- ✅ **Leveza**: Widget ~30-50KB vs Next.js ~200KB+
- ✅ **Performance**: Sem SSR overhead
- ✅ **Compatibilidade**: Funciona em qualquer site
- ✅ **Sem conflitos**: Não interfere com React/frameworks do cliente
- ✅ **Cache**: Facilita CDN e versionamento

---

## 🚀 Passo 1: Estrutura Base do Projeto

### 1.1 Criar Diretório do Projeto

```bash
# No mesmo nível do octop-frontend (NÃO dentro dele)
cd c:\Development
mkdir octop-widget
cd octop-widget
```

**Estrutura Final:**
```
c:\Development\
├── octop-frontend/       # Projeto Next.js existente
└── octop-widget/         # NOVO projeto do widget
```

### 1.2 Inicializar Projeto Node

```bash
npm init -y
```

---

## 📦 Passo 2: Instalar Dependências

### 2.1 Dependências de Build

```bash
npm install -D vite@^5.0.0 typescript@^5.0.0
npm install -D vite-plugin-css-injected-by-js@^3.0.0
```

**Justificativa:**
- **Vite**: Build tool moderno e rápido (substitui Webpack)
- **TypeScript**: Type safety (mesmo padrão do octop-frontend)
- **vite-plugin-css-injected-by-js**: Injeta CSS inline no JS (widget único)

### 2.2 Dependências Runtime (Mínimas)

```bash
npm install axios@^1.11.0
```

**Justificativa:**
- **axios**: Cliente HTTP (mesma lib do octop-frontend para consistência)
- Apenas isso! Widget precisa ser leve.

---

## 🔧 Passo 3: Configuração do TypeScript

### 3.1 Criar `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## ⚙️ Passo 4: Configuração do Vite

### 4.1 Criar `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin()  // CSS inline no bundle
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OctopChatWidget',  // Global var name
      fileName: () => 'widget.js',
      formats: ['iife']  // IIFE = Immediately Invoked Function Expression
    },
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
        assetFileNames: 'widget.[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
```

---

## 📂 Passo 5: Estrutura de Arquivos

### 5.1 Criar Estrutura de Pastas

```bash
mkdir src
mkdir src\components
mkdir src\api
mkdir src\utils
mkdir src\styles
mkdir src\types
```

### 5.2 Estrutura Final

```
octop-widget/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
├── src/
│   ├── index.ts                    # Entry point
│   ├── ChatWidget.ts               # Widget principal
│   │
│   ├── components/
│   │   ├── ChatBubble.ts           # Botão flutuante
│   │   ├── ChatWindow.ts           # Janela de chat
│   │   ├── ChatHeader.ts           # Cabeçalho
│   │   ├── ChatMessages.ts         # Lista de mensagens
│   │   └── ChatInput.ts            # Input de mensagem
│   │
│   ├── api/
│   │   └── client.ts               # Cliente API
│   │
│   ├── utils/
│   │   ├── anonymousId.ts          # Gerenciamento de ID anônimo
│   │   ├── storage.ts              # LocalStorage wrapper
│   │   └── dom.ts                  # Helpers DOM
│   │
│   ├── styles/
│   │   └── main.css                # Estilos do widget
│   │
│   └── types/
│       └── index.ts                # Types compartilhados
│
└── dist/
    └── widget.js                   # Build final (gerado)
```

---

## 📝 Passo 6: Scripts no package.json

### 6.1 Atualizar `package.json`

```json
{
  "name": "octop-chat-widget",
  "version": "1.0.0",
  "description": "Widget de chat embedável para o Octop",
  "main": "dist/widget.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "keywords": ["chat", "widget", "embed"],
  "author": "Octop",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vite-plugin-css-injected-by-js": "^3.0.0"
  },
  "dependencies": {
    "axios": "^1.11.0"
  }
}
```

---

## 💻 Passo 7: Implementação Base

### 7.1 Criar Types (`src/types/index.ts`)

```typescript
export interface WidgetConfig {
  embedKey: string;
  apiUrl: string;
}

export interface EmbedConfig {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  avatarUrl?: string;
  welcomeMessage?: string;
  active: boolean;
  embedKey: string;
  agentId: string;
}

export interface Message {
  id: string;
  content: string;
  author: 'agent' | 'contact';
  sendAt: string;
}

export interface ConversationResponse {
  conversationId: string;
  sessionId: string;
  userMessage: Message;
  agentMessage: Message;
}
```

### 7.2 Gerenciamento de ID Anônimo (`src/utils/anonymousId.ts`)

```typescript
/**
 * Gera e gerencia o ID anônimo do usuário.
 * Persiste no localStorage para manter identidade entre sessões.
 */

const STORAGE_KEY = 'octop_anonymous_id';

/**
 * Gera um UUID v4 simples
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtém ou cria o ID anônimo
 */
export function getAnonymousId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    
    if (!id) {
      id = `anon_${generateUUID()}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    
    return id;
  } catch (error) {
    // Fallback se localStorage não disponível
    console.warn('localStorage não disponível, usando ID de sessão');
    return `anon_session_${Date.now()}_${Math.random()}`;
  }
}

/**
 * Limpa o ID anônimo (útil para testes)
 */
export function clearAnonymousId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar anonymousId:', error);
  }
}
```

### 7.3 Cliente API (`src/api/client.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';
import type { EmbedConfig, ConversationResponse } from '../types';

export class WidgetApiClient {
  private api: AxiosInstance;
  private embedKey: string;

  constructor(apiUrl: string, embedKey: string) {
    this.embedKey = embedKey;
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Busca configuração pública do embed
   */
  async getEmbedConfig(): Promise<EmbedConfig> {
    const response = await this.api.get(`/embed/config/${this.embedKey}`);
    return response.data;
  }

  /**
   * Envia mensagem anônima
   */
  async sendMessage(
    content: string,
    anonymousId: string
  ): Promise<ConversationResponse> {
    const response = await this.api.post('/conversation/embed/send-message', {
      content,
      embedKey: this.embedKey,
      anonymousSessionId: anonymousId,
      fingerprint: this.getBrowserFingerprint(),
    });
    return response.data;
  }

  /**
   * Obtém histórico de conversa
   */
  async getHistory(anonymousId: string): Promise<ConversationResponse[]> {
    const response = await this.api.get(
      `/conversation/embed/history/${anonymousId}`
    );
    return response.data;
  }

  /**
   * Gera fingerprint básico do navegador
   */
  private getBrowserFingerprint(): string {
    const nav = navigator;
    const screen = window.screen;
    
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
    ].join('|');

    // Hash simples
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    
    return `fp_${Math.abs(hash).toString(36)}`;
  }
}
```

### 7.4 Estilos Base (`src/styles/main.css`)

```css
/* Reset e base */
.octop-widget * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.octop-widget {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-radius: 12px;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
}

/* Bubble Button */
.octop-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 999998;
}

.octop-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* Chat Window */
.octop-chat-window {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 380px;
  height: 600px;
  max-height: calc(100vh - 120px);
  background: var(--bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  z-index: 999999;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsivo */
@media (max-width: 480px) {
  .octop-chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
    bottom: 10px;
    right: 10px;
  }
}

/* Header */
.octop-chat-header {
  background-color: var(--primary-color);
  color: white;
  padding: 16px;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.octop-chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.octop-chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.octop-chat-title {
  font-size: 16px;
  font-weight: 600;
}

.octop-chat-subtitle {
  font-size: 12px;
  opacity: 0.9;
}

.octop-chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.octop-chat-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Messages */
.octop-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.octop-message {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.octop-message.agent {
  justify-content: flex-start;
}

.octop-message.contact {
  justify-content: flex-end;
}

.octop-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.octop-message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
}

.octop-message.agent .octop-message-bubble {
  background: white;
  color: var(--text-color);
}

.octop-message.contact .octop-message-bubble {
  background: var(--secondary-color);
  color: white;
}

.octop-message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

/* Input */
.octop-chat-input-container {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.octop-chat-input-form {
  display: flex;
  gap: 8px;
}

.octop-chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.octop-chat-input:focus {
  border-color: var(--primary-color);
}

.octop-chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.octop-chat-send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.octop-chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading */
.octop-loading {
  display: flex;
  gap: 4px;
  padding: 10px;
}

.octop-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
}

.octop-loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.octop-loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
```

### 7.5 Entry Point (`src/index.ts`)

```typescript
import './styles/main.css';
import { ChatWidget } from './ChatWidget';
import type { WidgetConfig } from './types';

// Exportar para uso global
declare global {
  interface Window {
    OctopChatWidget: typeof ChatWidget;
    OCTOP_CONFIG?: WidgetConfig;
  }
}

// Auto-inicializar se config existir
if (typeof window !== 'undefined') {
  window.OctopChatWidget = ChatWidget;

  // Tentar inicializar automaticamente
  if (window.OCTOP_CONFIG) {
    const config = window.OCTOP_CONFIG;
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new ChatWidget(config.apiUrl, config.embedKey);
      });
    } else {
      new ChatWidget(config.apiUrl, config.embedKey);
    }
  }
}

export { ChatWidget };
export type { WidgetConfig };
```

### 7.6 Widget Principal (`src/ChatWidget.ts`) - Estrutura Base

```typescript
import { WidgetApiClient } from './api/client';
import { getAnonymousId } from './utils/anonymousId';
import type { EmbedConfig, Message } from './types';

export class ChatWidget {
  private apiClient: WidgetApiClient;
  private anonymousId: string;
  private config: EmbedConfig | null = null;
  private isOpen: boolean = false;
  
  // Elementos DOM
  private bubble: HTMLElement | null = null;
  private chatWindow: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private messageInput: HTMLInputElement | null = null;

  constructor(apiUrl: string, embedKey: string) {
    this.apiClient = new WidgetApiClient(apiUrl, embedKey);
    this.anonymousId = getAnonymousId();
    
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Carregar configuração
      this.config = await this.apiClient.getEmbedConfig();
      
      if (!this.config.active) {
        console.warn('Widget está inativo');
        return;
      }

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
    if (!this.config) return;

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
    this.bubble.innerHTML = '💬';
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
          ${this.config?.avatarUrl ? `<img src="${this.config.avatarUrl}" class="octop-chat-avatar" alt="Avatar">` : ''}
          <div>
            <div class="octop-chat-title">${this.config?.title || 'Chat'}</div>
            <div class="octop-chat-subtitle">${this.config?.subtitle || 'Online agora'}</div>
          </div>
        </div>
        <button class="octop-chat-close">×</button>
      </div>
      <div class="octop-chat-messages"></div>
      <div class="octop-chat-input-container">
        <form class="octop-chat-input-form">
          <input 
            type="text" 
            class="octop-chat-input" 
            placeholder="Digite sua mensagem..."
            required
          >
          <button type="submit" class="octop-chat-send-btn">→</button>
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
        content,
        author: 'contact',
        sendAt: new Date().toISOString(),
      });

      // Mostrar loading
      this.showLoading();

      // Enviar para API
      const response = await this.apiClient.sendMessage(content, this.anonymousId);

      // Remover loading
      this.hideLoading();

      // Adicionar resposta do agente
      this.addMessage(response.agentMessage);

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
      ${message.author === 'agent' && this.config?.avatarUrl 
        ? `<img src="${this.config.avatarUrl}" class="octop-message-avatar" alt="Avatar">`
        : ''
      }
      <div>
        <div class="octop-message-bubble">${this.escapeHtml(message.content)}</div>
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
          this.addMessage(conv.agentMessage);
        });
      } else if (this.config?.welcomeMessage) {
        // Adicionar mensagem de boas-vindas
        this.addMessage({
          id: 'welcome',
          content: this.config.welcomeMessage,
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
      ${this.config?.avatarUrl 
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
      content: message,
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
```

---

## 🔧 Passo 8: Arquivo de Desenvolvimento

### 8.1 Criar `index.html` (para desenvolvimento)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Octop Widget - Teste</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
    }
    .info {
      background: #f0f0f0;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <h1>🧪 Teste do Widget Octop</h1>
  
  <div class="info">
    <h3>Instruções:</h3>
    <ol>
      <li>Execute <code>npm run dev</code> no terminal</li>
      <li>O widget aparecerá no canto inferior direito</li>
      <li>Configure o <code>embedKey</code> e <code>apiUrl</code> abaixo</li>
    </ol>
  </div>

  <p>
    Este é um site de teste. O widget de chat deve aparecer no canto inferior direito.
  </p>

  <!-- Configuração do Widget -->
  <script>
    window.OCTOP_CONFIG = {
      embedKey: 'SEU_EMBED_KEY_AQUI',  // Trocar pelo embedKey real
      apiUrl: 'http://localhost:3000'   // URL do backend
    };
  </script>

  <!-- Widget Script (carregado pelo Vite em dev) -->
  <script type="module" src="/src/index.ts"></script>
</body>
</html>
```

---

## 📄 Passo 9: Arquivos Adicionais

### 9.1 Criar `.gitignore`

```gitignore
# Dependências
node_modules/

# Build
dist/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
```

### 9.2 Criar `README.md`

```markdown
# Octop Chat Widget

Widget de chat embedável standalone para o sistema Octop.

## 🚀 Desenvolvimento

\`\`\`bash
npm install
npm run dev
\`\`\`

Abra http://localhost:5173 para ver o widget em ação.

## 🏗️ Build

\`\`\`bash
npm run build
\`\`\`

Gera o arquivo `dist/widget.js` pronto para produção.

## 📦 Instalação no Site do Cliente

Adicione antes do fechamento do `</body>`:

\`\`\`html
<script>
  window.OCTOP_CONFIG = {
    embedKey: "SEU_EMBED_KEY",
    apiUrl: "https://api.seudominio.com"
  };
</script>
<script src="https://cdn.seudominio.com/widget.js" async></script>
\`\`\`

## 🔧 Tecnologias

- TypeScript
- Vite
- Axios
- Vanilla JS/CSS
```

---

## ✅ Passo 10: Build e Teste

### 10.1 Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

### 10.2 Build de Produção

```bash
npm run build
```

Gera `dist/widget.js` (~40-60KB minificado)

### 10.3 Testar Build

```bash
npm run preview
```

---

## 🚀 Passo 11: Deploy

### Opção A: Backend NestJS (Simples)

1. Copiar `dist/widget.js` para `backend/public/embed/`
2. Configurar ServeStaticModule no NestJS
3. URL final: `https://api.seudominio.com/static/embed/widget.js`

### Opção B: CDN (Recomendado)

```bash
# Vercel
npm install -g vercel
vercel --prod

# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

URL final: `https://cdn.seudominio.com/widget.js`

---

## 📊 Comparativo de Tamanho

| Solução | Tamanho Minificado |
|---------|-------------------|
| Widget Octop | ~40-60KB |
| Next.js Bundle | ~200KB+ |
| React + ReactDOM | ~140KB |

**Resultado**: Widget 3-5x menor! 🎉

---

## 🔍 Troubleshooting

### Widget não aparece
- ✅ Verificar console do navegador
- ✅ Confirmar que `embedKey` está correto
- ✅ Verificar CORS no backend
- ✅ Confirmar que embed está `active: true`

### Erro de CORS
Adicionar no backend (NestJS):

```typescript
app.enableCors({
  origin: '*', // ou domínios específicos
  credentials: true,
});
```

### LocalStorage não funciona
- ✅ Verificar se site usa HTTPS
- ✅ Confirmar que cookies não estão bloqueados
- ✅ Fallback para sessionStorage já implementado

---

## 🎯 Próximos Passos

1. ✅ Implementar componentes restantes (ChatMessages, ChatInput, etc)
2. ✅ Adicionar animações de transição
3. ✅ Implementar reconexão automática
4. ✅ Adicionar suporte a markdown nas mensagens
5. ✅ Implementar WebSocket para real-time (opcional)
6. ✅ Adicionar testes unitários
7. ✅ Otimizar bundle size
8. ✅ Implementar temas pré-definidos

---

## 📚 Referências

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/)
- [Widget Best Practices](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency)

---

**Versão**: 1.0  
**Data**: 19 de Janeiro de 2026  
**Autor**: Octop Team

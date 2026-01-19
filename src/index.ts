import './styles/main.css';
import { ChatWidget } from './ChatWidget';
import type { WidgetConfig } from './types';

// Exportar para uso global
declare global {
  interface Window {
    OctopChatWidget: typeof ChatWidget;
    OctolkChatConfig?: WidgetConfig;
  }
}

// Auto-inicializar se config existir
if (typeof window !== 'undefined') {
  window.OctopChatWidget = ChatWidget;

  // Tentar inicializar automaticamente
  if (window.OctolkChatConfig) {
    const config = window.OctolkChatConfig;
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new ChatWidget(config);
      });
    } else {
      new ChatWidget(config);
    }
  }
}

export { ChatWidget };
export type { WidgetConfig };

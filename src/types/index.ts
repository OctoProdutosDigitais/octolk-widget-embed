export interface WidgetConfig {
  embedKey: string;
  apiUrl: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  avatarUrl?: string;
  welcomeMessage?: string;
}



export interface Message {
  id: string;
  text: string;
  author: 'agent' | 'contact';
  sendAt: string;
}

export interface ConversationResponse {
  conversationId: string;
  sessionId: string;
  userMessage: Message;
  agentResponse: Message;
}

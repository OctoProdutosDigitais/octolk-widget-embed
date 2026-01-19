import axios, { AxiosInstance } from 'axios';
import type { ConversationResponse } from '../types';

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

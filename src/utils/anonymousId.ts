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

// Segurança de Sessão e Headers HTTP

export class SessionSecurity {
  private static sessionTimeout: ReturnType<typeof setTimeout> | null = null;
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutos
  private static readonly WARNING_DURATION = 5 * 60 * 1000; // 5 minutos antes

  // Iniciar monitoramento de sessão
  static startSessionMonitoring(onTimeout: () => void, onWarning: () => void): void {
    this.clearSessionMonitoring();

    // Warning antes do timeout
    this.sessionTimeout = setTimeout(() => {
      onWarning();
      
      // Timeout final
      setTimeout(() => {
        onTimeout();
        this.logSecurityEvent('SESSION_TIMEOUT', { timestamp: new Date().toISOString() });
      }, this.WARNING_DURATION);
    }, this.SESSION_DURATION - this.WARNING_DURATION);

    // Logging de início de sessão
    this.logSecurityEvent('SESSION_STARTED', { 
      duration: this.SESSION_DURATION,
      timestamp: new Date().toISOString()
    });
  }

  // Limpar monitoramento
  static clearSessionMonitoring(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  // Resetar sessão (atividade do usuário)
  static resetSession(onTimeout: () => void, onWarning: () => void): void {
    this.logSecurityEvent('SESSION_RESET', { timestamp: new Date().toISOString() });
    this.startSessionMonitoring(onTimeout, onWarning);
  }

  // Headers de segurança (para uso em produção)
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 
        'geolocation=(), ' +
        'microphone=(), ' +
        'camera=(), ' +
        'payment=(), ' +
        'usb=(), ' +
        'magnetometer=(), ' +
        'gyroscope=(), ' +
        'accelerometer=()'
    };
  }

  // Verificar se a sessão está ativa
  static isSessionActive(): boolean {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;
    
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity < this.SESSION_DURATION;
  }

  // Atualizar última atividade
  static updateLastActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  // Detectar múltiplas sessões
  static detectMultipleSessions(userId: string): boolean {
    const currentSessionId = this.getSessionId();
    const storedSessionId = sessionStorage.getItem(`session_${userId}`);
    
    if (storedSessionId && storedSessionId !== currentSessionId) {
      this.logSecurityEvent('MULTIPLE_SESSIONS_DETECTED', { 
        userId, 
        currentSessionId, 
        storedSessionId 
      });
      return true;
    }
    
    sessionStorage.setItem(`session_${userId}`, currentSessionId);
    return false;
  }

  // Gerar ID de sessão único
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSecureToken();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Gerar token seguro
  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Logging de segurança
  private static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent
    };
    
    console.warn('SESSION SECURITY:', logEntry);
    
    // Em produção, enviar para backend
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para serviço de monitoramento
    }
  }

  // Limpar dados de sessão
  static clearSessionData(): void {
    sessionStorage.clear();
    localStorage.removeItem('lastActivity');
    this.logSecurityEvent('SESSION_CLEARED', { timestamp: new Date().toISOString() });
  }

  // Verificar integridade da sessão
  static verifySessionIntegrity(): boolean {
    const sessionId = sessionStorage.getItem('sessionId');
    const sessionStart = sessionStorage.getItem('sessionStart');
    
    if (!sessionId || !sessionStart) {
      return false;
    }
    
    // Verificar se a sessão não está muito antiga
    const sessionAge = Date.now() - parseInt(sessionStart);
    if (sessionAge > 24 * 60 * 60 * 1000) { // 24 horas
      this.logSecurityEvent('SESSION_TOO_OLD', { sessionAge });
      return false;
    }
    
    return true;
  }

  // Inicializar sessão
  static initializeSession(): void {
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
      this.logSecurityEvent('SESSION_INITIALIZED', { 
        sessionId: this.getSessionId(),
        timestamp: new Date().toISOString()
      });
    }
  }
}

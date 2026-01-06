// Sistema de Cibersegurança para App Imobiliário

export class SecurityUtils {
  // Rate limiting para tentativas de login
  private static loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>();
  
  // Sanitização de inputs contra XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove tags HTML
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/['"]/g, '') // Remove aspas
      .trim();
  }

  // Validação de senha forte
  static validateStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    // Verificar senhas comuns
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'admin', 'senha'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Senha muito comum. Escolha uma senha mais segura');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting para login
  static checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number; blockTimeRemaining: number } {
    const now = Date.now();
    const key = email.toLowerCase();
    const attempts = this.loginAttempts.get(key);
    
    if (!attempts) {
      this.loginAttempts.set(key, { count: 0, lastAttempt: now, blockedUntil: 0 });
      return { allowed: true, remainingAttempts: 5, blockTimeRemaining: 0 };
    }
    
    // Se está bloqueado, verificar se o tempo de bloqueio passou
    if (now < attempts.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        blockTimeRemaining: Math.ceil((attempts.blockedUntil - now) / 1000)
      };
    }
    
    // Resetar contador se passou 15 minutos
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      attempts.count = 0;
    }
    
    const maxAttempts = 5;
    const blockDuration = 15 * 60 * 1000; // 15 minutos
    
    if (attempts.count >= maxAttempts) {
      attempts.blockedUntil = now + blockDuration;
      attempts.count = 0;
      return {
        allowed: false,
        remainingAttempts: 0,
        blockTimeRemaining: Math.ceil(blockDuration / 1000)
      };
    }
    
    return {
      allowed: true,
      remainingAttempts: maxAttempts - attempts.count,
      blockTimeRemaining: 0
    };
  }

  // Registrar tentativa de login
  static recordLoginAttempt(email: string, success: boolean): void {
    const key = email.toLowerCase();
    const attempts = this.loginAttempts.get(key);
    
    if (attempts) {
      if (!success) {
        attempts.count++;
        attempts.lastAttempt = Date.now();
      } else {
        // Resetar em caso de sucesso
        attempts.count = 0;
        attempts.blockedUntil = 0;
      }
    }
  }

  // Gerar token CSRF simplificado
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validar origem da requisição (básico)
  static validateOrigin(): boolean {
    // Em produção, verificar se a origem é permitida
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = ['http://localhost:3000', 'https://seu-dominio.com'];
      return allowedOrigins.includes(window.location.origin);
    }
    return true; // Em desenvolvimento, permitir
  }

  // Detectar tentativas de força bruta
  static detectBruteForce(email: string): boolean {
    const key = email.toLowerCase();
    const attempts = this.loginAttempts.get(key);
    
    if (!attempts) return false;
    
    const now = Date.now();
    const recentAttempts = attempts.count;
    const timeWindow = 5 * 60 * 1000; // 5 minutos
    
    if (recentAttempts >= 3 && (now - attempts.lastAttempt) < timeWindow) {
      return true;
    }
    
    return false;
  }

  // Logging de segurança
  static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Em produção, capturar IP real no backend
    };
    
    console.warn('SECURITY LOG:', logEntry);
    
    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      // Implementar envio para backend/SIEM
    }
  }

  // Verificar se o dispositivo é conhecido
  static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      (window.screen?.width || 0) + 'x' + (window.screen?.height || 0),
      new Date().getTimezoneOffset(),
      canvas?.toDataURL() || ''
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }
}

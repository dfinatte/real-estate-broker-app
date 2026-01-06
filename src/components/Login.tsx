import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { SecurityUtils } from '../utils/security';
import EmailVerification from './EmailVerification';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState({ allowed: true, remainingAttempts: 5, blockTimeRemaining: 0 });
  const [csrfToken] = useState(() => SecurityUtils.generateCSRFToken());

  // Função de validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação em tempo real do email com sanitização
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = SecurityUtils.sanitizeInput(e.target.value);
    setFormData({ ...formData, email: value });
    
    if (value && !validateEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  // Validação de senha em tempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = SecurityUtils.sanitizeInput(e.target.value);
    setFormData({ ...formData, password: value });
    
    if (value) {
      const validation = SecurityUtils.validateStrongPassword(value);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  // Verificar rate limit ao montar componente
  useEffect(() => {
    if (formData.email) {
      const rateLimit = SecurityUtils.checkRateLimit(formData.email);
      setRateLimitInfo(rateLimit);
    }
  }, [formData.email]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!isLogin) {
      const passwordValidation = SecurityUtils.validateStrongPassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Rate limiting para registro
      const rateLimitKey = `register_${formData.email}`;
      const rateLimitResult = SecurityUtils.checkRateLimit(rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new Error('Muitas tentativas de registro. Tente novamente em 15 minutos.');
      }

      // Sanitizar entrada
      const sanitizedEmail = SecurityUtils.sanitizeInput(formData.email);
      const sanitizedPassword = formData.password;

      // Log de segurança
      SecurityUtils.logSecurityEvent('register_attempt', {
        email: sanitizedEmail,
        ip: 'client-side',
        userAgent: navigator.userAgent
      });

      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        sanitizedEmail, 
        sanitizedPassword
      );

      // Enviar email de verificação
      await sendEmailVerification(userCredential.user);

      // Salvar credenciais pendentes para verificação
      setPendingCredentials({ email: sanitizedEmail, password: sanitizedPassword });
      
      // Mostrar tela de verificação
      setShowEmailVerification(true);

      // Log de sucesso
      SecurityUtils.logSecurityEvent('register_success', {
        email: sanitizedEmail,
        userId: userCredential.user.uid
      });

    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Log de erro
      SecurityUtils.logSecurityEvent('register_error', {
        email: formData.email,
        error: error.message
      });

      // Tratar erros específicos
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'Este email já está em uso. Tente fazer login.' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: 'A senha é muito fraca. Use pelo menos 6 caracteres.' });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: 'Email inválido.' });
      } else {
        setErrors({ general: error.message || 'Erro ao criar conta. Tente novamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      await handleRegister(e);
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    // Validar origem da requisição
    if (!SecurityUtils.validateOrigin()) {
      setErrors({ general: 'Origem da requisição inválida' });
      SecurityUtils.logSecurityEvent('INVALID_ORIGIN', { email: formData.email });
      setIsLoading(false);
      return;
    }

    // Verificar rate limiting
    const rateLimit = SecurityUtils.checkRateLimit(formData.email);
    if (!rateLimit.allowed) {
      if (rateLimit.blockTimeRemaining > 0) {
        setErrors({ general: `Conta bloqueada por tentativas excessivas. Tente novamente em ${rateLimit.blockTimeRemaining} segundos` });
        SecurityUtils.logSecurityEvent('RATE_LIMIT_BLOCKED', { email: formData.email, blockTime: rateLimit.blockTimeRemaining });
      } else {
        setErrors({ general: 'Limite de tentativas excedido. Tente novamente mais tarde' });
      }
      setIsLoading(false);
      return;
    }

    // Validação de email
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Por favor, insira um email válido' });
      setIsLoading(false);
      return;
    }

    // Validação básica para login
    if (formData.password.length < 8) {
      setErrors({ password: 'A senha deve ter pelo menos 8 caracteres' });
      setIsLoading(false);
      return;
    }

    // Detectar força bruta
    if (SecurityUtils.detectBruteForce(formData.email)) {
      setErrors({ general: 'Atividade suspeita detectada. Aguarde antes de tentar novamente' });
      SecurityUtils.logSecurityEvent('BRUTE_FORCE_DETECTED', { email: formData.email });
      setIsLoading(false);
      return;
    }

    // Gerar fingerprint do dispositivo
    const deviceFingerprint = SecurityUtils.getDeviceFingerprint();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      if (!userCredential.user.emailVerified) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch {
          // Ignorar erro de reenvio; usuário ainda pode verificar com email já enviado anteriormente.
        }

        await signOut(auth);
        setPendingCredentials({ email: formData.email, password: formData.password });
        setShowEmailVerification(true);
        setIsLoading(false);
        return;
      }

      SecurityUtils.logSecurityEvent('USER_LOGIN_SUCCESS', { 
        email: formData.email, 
        deviceFingerprint,
        timestamp: new Date().toISOString()
      });
      
      // Registrar tentativa bem-sucedida
      SecurityUtils.recordLoginAttempt(formData.email, true);
      
    } catch (err: any) {
      // Registrar tentativa falha
      SecurityUtils.recordLoginAttempt(formData.email, false);
      
      // Logging detalhado do erro
      SecurityUtils.logSecurityEvent('AUTH_ERROR', { 
        email: formData.email, 
        errorCode: err.code,
        errorMessage: err.message,
        deviceFingerprint,
        isRegister: false
      });
      
      // Tratamento de erros específicos
      if (err.code === 'auth/user-not-found') {
        setErrors({ general: 'Usuário não encontrado. Verifique o email.' });
      } else if (err.code === 'auth/wrong-password') {
        setErrors({ general: 'Senha incorreta. Tente novamente.' });
      } else if (err.code === 'auth/email-already-in-use') {
        setErrors({ general: 'Este email já está em uso. Tente fazer login.' });
      } else if (err.code === 'auth/weak-password') {
        setErrors({ general: 'A senha é muito fraca. Use pelo menos 8 caracteres com maiúsculas, números e caracteres especiais.' });
      } else if (err.code === 'auth/invalid-email') {
        setErrors({ general: 'Email inválido. Verifique o formato.' });
      } else if (err.code === 'auth/too-many-requests') {
        setErrors({ general: 'Muitas tentativas. Conta temporariamente bloqueada por segurança.' });
      } else {
        setErrors({ general: 'Erro ao autenticar. Tente novamente mais tarde.' });
      }
    } finally {
      setIsLoading(false);
      // Atualizar informações de rate limit
      const updatedRateLimit = SecurityUtils.checkRateLimit(formData.email);
      setRateLimitInfo(updatedRateLimit);
    }
  };

  // Handlers para verificação de email
  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setPendingCredentials(null);
    // O AuthContext vai detectar automaticamente a mudança de estado
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setPendingCredentials(null);
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  // Se estiver mostrando a tela de verificação
  if (showEmailVerification && pendingCredentials) {
    return (
      <EmailVerification
        email={pendingCredentials.email}
        password={pendingCredentials.password}
        onVerified={handleEmailVerified}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? 'Login' : 'Criar Conta'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? 'Entre com suas credenciais' : 'Cadastre-se para acessar o sistema'}
        </p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errors.general}
          </div>
        )}

        {/* Indicador de Rate Limiting */}
        {!rateLimitInfo.allowed && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>
                {rateLimitInfo.blockTimeRemaining > 0 
                  ? `Conta bloqueada. Tente em ${rateLimitInfo.blockTimeRemaining}s` 
                  : 'Limite de tentativas excedido'}
              </span>
            </div>
          </div>
        )}

        {/* Indicador de tentativas restantes */}
        {rateLimitInfo.allowed && rateLimitInfo.remainingAttempts < 5 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg mb-4 text-sm">
            Tentativas restantes: {rateLimitInfo.remainingAttempts}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  emailError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
                required
              />
              {emailError && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 text-red-500" title={emailError}>
                    ⚠️
                  </div>
                </div>
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha {!isLogin && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  passwordErrors.length > 0 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder={isLogin ? "Mínimo 8 caracteres" : "••••••••"}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Feedback de senha forte */}
            {!isLogin && formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-full h-2 rounded-full ${
                    passwordErrors.length === 0 ? 'bg-green-500' : 
                    passwordErrors.length <= 2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-600">
                  Força da senha: {
                    passwordErrors.length === 0 ? 'Forte ✅' : 
                    passwordErrors.length <= 2 ? 'Média ⚠️' : 'Fraca ❌'
                  }
                </p>
                {passwordErrors.length > 0 && (
                  <ul className="mt-1 text-xs text-red-600">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setEmailError('');
              setPasswordErrors([]);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>

        {/* Selo de Segurança */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Protegido com criptografia e segurança avançada</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            <span>🔐 Login Seguro</span>
            <span>🛡️ Anti-Força Bruta</span>
            <span>🔒 Rate Limiting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

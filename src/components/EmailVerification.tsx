import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

interface EmailVerificationProps {
  email: string;
  password: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  password, 
  onVerified, 
  onBack 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Countdown para reenviar email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reenviar email de verificação
  const handleResendEmail = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await sendEmailVerification(user);
      setSuccess('Email de verificação reenviado com sucesso!');
      setCountdown(60);
      await auth.signOut();
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      setError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  // Verificar se o email foi verificado
  const handleCheckVerification = async () => {
    if (isChecking) return;

    setIsChecking(true);
    setError('');

    try {
      // Fazer login novamente para obter o estado atualizado do usuário
      await signInWithEmailAndPassword(auth, email, password);
      
      const user = auth.currentUser;
      if (user && user.emailVerified) {
        setSuccess('Email verificado com sucesso! Redirecionando...');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('Email ainda não foi verificado. Verifique sua caixa de entrada.');
      }
    } catch (error: any) {
      console.error('Erro ao verificar:', error);
      setError('Erro ao verificar o status do email. Tente fazer login novamente.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifique seu Email
          </h2>
          <p className="text-gray-600">
            Enviamos um link de verificação para:
          </p>
          <p className="font-semibold text-blue-600 mt-1">{email}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Próximos passos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra sua caixa de entrada</li>
                <li>Encontre o email de "ABC Paulista Imóveis"</li>
                <li>Clique no link de verificação</li>
                <li>Volte aqui e clique em "Verificar"</li>
              </ol>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={isChecking}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Já Verifiquei meu Email
              </>
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || isResending}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {countdown > 0 ? `Reenviar (${countdown}s)` : 'Reenviar Email'}
              </>
            )}
          </button>

          <button
            onClick={onBack}
            className="w-full text-gray-600 py-2 px-4 text-sm hover:text-gray-800 transition-colors"
          >
            Voltar para o Login
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

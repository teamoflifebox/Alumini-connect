import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasFired = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    if (hasFired.current) return;
    hasFired.current = true;

    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Invalid or expired verification link.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-[#15171c] border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your details.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-8">
              Your email address has been successfully verified. You can now log into your account.
            </p>
            <Link 
              to="/login"
              className="bg-primary text-white font-bold py-3 px-8 rounded-xl w-full hover:bg-brand-600 transition-colors block"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-8">{errorMessage}</p>
            <Link 
              to="/login"
              className="border border-white/10 hover:bg-white/5 text-white font-bold py-3 px-8 rounded-xl w-full transition-colors block"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

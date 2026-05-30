import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuth } from '../hooks/useAuth';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    if (errorParam || errorDesc) {
      setError(errorDesc || errorParam || 'Unknown LinkedIn error');
      return;
    }

    if (!code) {
      setError('No authorization code found in URL');
      return;
    }

    authApi.linkedinLogin(code, `${window.location.origin}/linkedin`)
      .then(response => {
        const { user, accessToken } = response.data.data;
        const mappedUser = { ...user, role: (user as any).primary_role || user.role };
        setAuth(mappedUser, accessToken);
        navigate('/dashboard');
      })
      .catch(err => {
        console.error('LinkedIn API Error:', err);
        setError(err.response?.data?.message || err.message || 'LinkedIn authentication failed');
      });
  }, [navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white flex-col gap-6 p-4 text-center">
        <h2 className="text-3xl text-red-500 font-bold">Authentication Failed</h2>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => navigate('/login')} 
          className="bg-primary hover:bg-brand-600 px-6 py-3 rounded-xl font-bold transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="ml-4 font-bold text-lg">Authenticating with LinkedIn...</span>
    </div>
  );
}

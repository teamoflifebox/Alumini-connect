import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Shown after self-registration when admin has NOT yet verified the account.
 * Politely tells the user to check their email for the verification link.
 */
const PendingVerificationPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-8 border border-white/10 rounded-2xl shadow-sm bg-[#1c1f26]">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-muted-foreground mb-6">
          Your account has been registered successfully! Please click the verification link we just sent to your email address to activate your account.
        </p>
        <button 
          onClick={handleLogout}
          className="bg-primary hover:bg-brand-600 px-6 py-2 rounded-xl text-white font-bold transition-all"
        >
          Logout & Try Again
        </button>
      </div>
    </div>
  );
};
export default PendingVerificationPage;

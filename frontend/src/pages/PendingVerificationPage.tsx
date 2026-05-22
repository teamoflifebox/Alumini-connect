/**
 * Shown after self-registration when admin has NOT yet verified the account.
 * Politely tells the user to check their email for the verification link.
 */
const PendingVerificationPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md text-center p-8 border border-white/10 rounded-2xl shadow-sm bg-[#1c1f26]">
      <div className="text-5xl mb-4">📧</div>
      <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
      <p className="text-muted-foreground">
        Your account has been registered successfully! Please click the verification link we just sent to your email address to activate your account.
      </p>
    </div>
  </div>
);
export default PendingVerificationPage;

/**
 * Shown after self-registration when admin has NOT yet verified the account.
 * Politely tells the user to wait for admin approval.
 */
const PendingVerificationPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md text-center p-8 border rounded-2xl shadow-sm">
      <div className="text-5xl mb-4">⏳</div>
      <h1 className="text-2xl font-bold mb-2">Account Pending Verification</h1>
      <p className="text-muted-foreground">
        Your account has been registered successfully! An admin will verify your details
        and activate your account shortly. You will receive an email once approved.
      </p>
    </div>
  </div>
);
export default PendingVerificationPage;

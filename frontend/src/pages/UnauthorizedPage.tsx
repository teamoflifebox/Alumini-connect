import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md text-center p-8">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-3xl font-bold mb-2">403 — Unauthorized</h1>
      <p className="text-muted-foreground mb-6">
        You do not have permission to access this page.
      </p>
      <Link to="/dashboard" className="text-primary underline underline-offset-4">
        Back to Dashboard
      </Link>
    </div>
  </div>
);
export default UnauthorizedPage;

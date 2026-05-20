import helmet from 'helmet';

/** Secure HTTP headers and hide framework fingerprint */
export const securityMiddleware = helmet({
  hidePoweredBy: true,
  contentSecurityPolicy: false, // API-only backend; adjust when serving static assets
});

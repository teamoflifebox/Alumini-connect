import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { env } from './env';
import { authOAuthService } from '../modules/auth/auth.oauth.service';
import { authService } from '../modules/auth/auth.service';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: any, done) => {
  // We don't strictly need this for JWT-based auth as we're not relying on sessions for API calls,
  // but passport requires serialization functions.
  done(null, { id });
});

if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
    const strategy = new LinkedInStrategy(
      {
        clientID: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
        callbackURL: 'http://localhost:5001/api/v1/auth/linkedin/callback',
        scope: ['openid', 'profile', 'email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Since we override userProfile, `profile` is already what we return below
          const email = profile.email;
          const picture = profile.picture;
          
          if (!email) {
            return done(new Error('LinkedIn profile missing email'), null);
          }

          // Use our existing OAuth service to find or create the user in the database
          const user = await authOAuthService.findOrCreateOAuthUser({
            email,
            name: profile.name || email.split('@')[0],
            provider: 'linkedin',
            providerId: profile.sub,
            avatarUrl: picture,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    );

    // Modern LinkedIn OIDC requires fetching from /v2/userinfo instead of /v2/me
    // passport-linkedin-oauth2 hardcodes /v2/me, so we override the userProfile function:
    (strategy as any).userProfile = async function(accessToken: string, done: any) {
      try {
        const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error(`LinkedIn Profile Fetch Error (${profileRes.status}):`, errorText);
          return done(new Error(`Failed to fetch user profile from LinkedIn. Status: ${profileRes.status}`));
        }

        const json = await profileRes.json();
        return done(null, json);
      } catch (e) {
        console.error('LinkedIn Profile Fetch Exception:', e);
        return done(e);
      }
    };

    passport.use(strategy);
} else {
  console.warn('LinkedIn OAuth is not configured. Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET.');
}

export default passport;

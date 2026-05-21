import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { authRepository } from './auth.repository';
import { AuthResponse, UserRecord } from './auth.types';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { generateSecureToken } from '../../utils/token';
import { authService } from './auth.service';

interface LinkedInProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
}

export class AuthOAuthService {
  private getGoogleClient(): OAuth2Client {
    const clientId = env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new AppError('Google OAuth is not configured', 500);
    }
    return new OAuth2Client(clientId);
  }

  private async randomPasswordHash(): Promise<string> {
    return bcrypt.hash(generateSecureToken(48), 10);
  }

  public async findOrCreateOAuthUser(data: {
    email: string;
    name: string;
    provider: 'google' | 'linkedin';
    providerId: string;
    avatarUrl?: string;
  }): Promise<UserRecord> {
    const byProvider = await authRepository.findUserByProvider(data.provider, data.providerId);
    if (byProvider) return byProvider;

    const byEmail = await authRepository.findUserByEmail(data.email);
    if (byEmail) {
      await authRepository.linkOAuthProvider(String(byEmail.id), {
        provider: data.provider,
        providerId: data.providerId,
        avatarUrl: data.avatarUrl,
        isVerified: true,
      });
      const updated = await authRepository.findUserById(String(byEmail.id));
      return updated!;
    }

    return authRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash: await this.randomPasswordHash(),
      role: 'alumni',
      isVerified: true,
      provider: data.provider,
      providerId: data.providerId,
      avatarUrl: data.avatarUrl,
    });
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const clientId = env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new AppError(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID in backend/.env and restart the server.',
        500
      );
    }

    const ticket = await this.getGoogleClient().verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new AppError('Invalid Google token', 401);
    }

    const user = await this.findOrCreateOAuthUser({
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      provider: 'google',
      providerId: payload.sub,
      avatarUrl: payload.picture,
    });

    return authService.buildAuthResponseForUser(user);
  }

  async linkedinLogin(accessToken: string): Promise<AuthResponse> {
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      throw new AppError('Invalid LinkedIn access token', 401);
    }

    const profile = (await profileRes.json()) as LinkedInProfile;

    if (!profile.sub || !profile.email) {
      throw new AppError('LinkedIn profile missing required fields', 400);
    }

    const name =
      profile.name ||
      `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
      profile.email.split('@')[0];

    const user = await this.findOrCreateOAuthUser({
      email: profile.email,
      name,
      provider: 'linkedin',
      providerId: profile.sub,
      avatarUrl: profile.picture,
    });

    return authService.buildAuthResponseForUser(user);
  }
}

export const authOAuthService = new AuthOAuthService();

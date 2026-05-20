import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import {
  AuthResponse,
  JwtPayload,
  SafeUser,
  TokenPair,
  UserRecord,
  UserRole,
} from './auth.types';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { authVerificationService } from './auth.verification.service';

export { AppError };

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

const getAccessSecret = () => env.JWT_ACCESS_SECRET;
const getRefreshSecret = () => env.JWT_REFRESH_SECRET;

export class AuthService {
  private formatName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  private toSafeUser(user: UserRecord): SafeUser {
    const name =
      user.name?.trim() || this.formatName(user.first_name || '', user.last_name || '');

    return {
      id: String(user.id),
      name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      provider: user.provider || 'local',
      avatar_url: user.avatar_url ?? null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private assertSecrets() {
    if (!getAccessSecret() || !getRefreshSecret()) {
      throw new AppError('JWT secrets are not configured', 500);
    }
  }

  private generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, getAccessSecret(), { expiresIn: ACCESS_EXPIRY });
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_EXPIRY });
  }

  private async hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private async issueTokens(user: UserRecord): Promise<TokenPair> {
    this.assertSecrets();
    const payload: JwtPayload = {
      id: String(user.id),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);
    await authRepository.updateRefreshToken(String(user.id), refreshTokenHash);
    return { accessToken, refreshToken };
  }

  async buildAuthResponseForUser(user: UserRecord): Promise<AuthResponse> {
    const tokens = await this.issueTokens(user);
    return {
      user: this.toSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async verifyCredentials(email: string, password: string, role: UserRole) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || user.role !== role) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.provider && user.provider !== 'local') {
      throw new AppError(`Please sign in with ${user.provider}`, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    authVerificationService.assertEmailVerified(user);
    return user;
  }

  async adminLogin(email: string, password: string) {
    const user = await this.verifyCredentials(email, password, 'admin');
    return this.buildAuthResponseForUser(user);
  }

  async studentLogin(email: string, password: string) {
    const user = await this.verifyCredentials(email, password, 'student');
    return this.buildAuthResponseForUser(user);
  }

  async alumniLogin(email: string, password: string) {
    const user = await this.verifyCredentials(email, password, 'alumni');
    return this.buildAuthResponseForUser(user);
  }

  async alumniRegister(name: string, email: string, password: string): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'alumni',
      isVerified: false,
      provider: 'local',
    });

    try {
      await authVerificationService.sendVerificationEmail(String(user.id));
    } catch {
      // Registration succeeds even if email fails in dev without SMTP
    }

    return this.buildAuthResponseForUser(user);
  }

  async createStudent(name: string, email: string, password: string): Promise<SafeUser> {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'student',
      isVerified: true,
      provider: 'local',
    });

    return this.toSafeUser(user);
  }

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    this.assertSecrets();

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret()) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    const user = await authRepository.findUserById(decoded.id);
    if (!user || !user.refresh_token) {
      throw new AppError('Invalid or expired refresh token', 403);
    }

    const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isValid) {
      await authRepository.updateRefreshToken(String(user.id), null);
      throw new AppError('Invalid or expired refresh token', 403);
    }

    return this.buildAuthResponseForUser(user);
  }

  async logout(userId: string) {
    await authRepository.updateRefreshToken(userId, null);
  }

  async getUserById(id: string): Promise<SafeUser> {
    const user = await authRepository.findUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.toSafeUser(user);
  }

  async register(userData: { name: string; email: string; password: string }): Promise<AuthResponse> {
    return this.alumniRegister(userData.name, userData.email, userData.password);
  }

  async login(credentials: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.provider && user.provider !== 'local') {
      throw new AppError(`Please sign in with ${user.provider}`, 401);
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    authVerificationService.assertEmailVerified(user);
    return this.buildAuthResponseForUser(user);
  }
}

export const authService = new AuthService();

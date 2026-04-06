import type {
  AuthResponse,
  LoginProvider,
  SessionUser,
  User,
} from "../../shared/types/index.js";
import type { LocalLoginInput, MsalLoginInput } from "../../shared/validators/index.js";
import { verifyMsalIdToken } from "../lib/auth/msal.js";
import { normalizeEmail } from "../lib/normalize.js";
import { verifyPassword } from "../lib/auth/password.js";
import { createSessionToken } from "../lib/auth/session.js";
import { AppError } from "../lib/errors.js";
import { UserRepository } from "../repositories/user.repository.js";

class AuthError extends AppError {
  constructor(
    message: string,
    readonly status: 401 | 403 | 500
  ) {
    super(message, status);
    this.name = "AuthError";
  }
}

export class AuthService {
  private readonly repo: UserRepository;

  constructor(repo?: UserRepository) {
    this.repo = repo ?? new UserRepository();
  }

  async loginWithPassword(input: LocalLoginInput) {
    const user = await this.repo.findByUserId(normalizeEmail(input.userId) ?? input.userId);
    if (!user || !user.passwordHash || !user.hasLocalPassword) {
      throw new AuthError("Invalid user ID or password", 401);
    }
    if (!user.isActive) {
      throw new AuthError("User is inactive", 403);
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AuthError("Invalid user ID or password", 401);
    }

    return this.createLoginResult(user, "local");
  }

  async loginWithMsal(input: MsalLoginInput) {
    const token = input.idToken ?? input.accessToken;
    if (!token) {
      throw new AuthError("MSAL token is required", 401);
    }

    const identity = await verifyMsalIdToken(token);
    const user = await this.repo.findByMsalIdentity(
      identity.tenantId,
      identity.oid,
      identity.email
    );

    if (!user) {
      throw new AuthError("MSAL user is not registered", 403);
    }
    if (!user.isActive) {
      throw new AuthError("User is inactive", 403);
    }

    return this.createLoginResult(user, "msal");
  }

  async getSessionUserById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  static toPublicUser(user: SessionUser): AuthResponse["user"] {
    return {
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      loginProvider: user.loginProvider,
    };
  }

  private async createLoginResult(user: User, loginProvider: LoginProvider) {
    const sessionUser: SessionUser = {
      internalUserId: user.id,
      userId: user.userId,
      email: user.email,
      displayName: user.displayName ?? user.name,
      roles: user.roles ?? [],
      loginProvider,
      sessionVersion: user.sessionVersion ?? 0,
    };

    const token = await createSessionToken(sessionUser);
    return {
      token,
      user: AuthService.toPublicUser(sessionUser),
    };
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

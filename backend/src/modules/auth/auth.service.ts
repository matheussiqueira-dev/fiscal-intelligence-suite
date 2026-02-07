import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError, UnauthorizedError } from '../../core/errors.js';
import { JwtPayload, User, UserRole } from '../../domain/types.js';
import { UserRepository } from './user.repository.js';
import type { SignOptions } from 'jsonwebtoken';

interface SeedUserInput {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly expiresIn: string,
  ) {}

  async seedUsers(seedEntries: SeedUserInput[]): Promise<void> {
    const existing = await this.userRepository.list();
    const existingEmails = new Set(existing.map((user) => user.email));

    const usersToCreate: User[] = [];

    for (const entry of seedEntries) {
      const normalizedEmail = entry.email.trim().toLowerCase();
      if (existingEmails.has(normalizedEmail)) continue;

      const passwordHash = await bcrypt.hash(entry.password, 10);

      usersToCreate.push({
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: entry.name,
        role: entry.role,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
    }

    if (usersToCreate.length > 0) {
      await this.userRepository.createMany(usersToCreate);
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = this.issueToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
      accessToken: token,
      user: safeUser,
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired token.');
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private issueToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  }
}

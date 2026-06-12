import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/config/db';
import { BadRequestError, UnauthorizedError } from '@/utils/apiErrors';
import { z } from 'zod';
import { registerSchema } from '@/validators/auth';
import { Role } from '@prisma/client';

type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'jwt_access_secret_key_123';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key_456';

  public static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email address is already in use by another account.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const isAdminEmail = input.email.toLowerCase() === (process.env.ADMIN_EMAIL || 'admin@mandiprime.com').toLowerCase();
      const assignedRole = isAdminEmail ? Role.ADMIN : input.role;

      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: assignedRole,
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName: input.fullName,
          phone: input.phone,
          companyName: input.companyName,
          address: input.address,
          city: input.city,
          country: input.country,
          bio: input.bio,
        },
      });

      return newUser;
    });

    const tokens = await this.generateAuthTokens(user.id, user.email, user.role);
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }

  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokens = await this.generateAuthTokens(user.id, user.email, user.role);
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }

  public static async refreshAccessToken(refreshTokenStr: string) {
    try {
      const payload = jwt.verify(refreshTokenStr, this.REFRESH_SECRET) as { id: string; email: string; role: Role };

      // Verify token exists in database and is not expired
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenStr },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        if (storedToken) {
          await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        }
        throw new UnauthorizedError('Refresh token has expired or is invalid.');
      }

      // Generate a new access token (Keep the same refresh token, or roll it. Rolling is safer, so let's generate a new one)
      const accessToken = jwt.sign(
        { id: payload.id, email: payload.email, role: payload.role },
        this.ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token.');
    }
  }

  public static async logout(refreshTokenStr: string) {
    // Delete token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenStr },
    });
  }

  private static async generateAuthTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign(
      { id: userId, email, role },
      this.ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: userId, email, role },
      this.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to db
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}

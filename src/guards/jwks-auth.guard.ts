import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class JwksAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwksAuthGuard.name);
  private readonly client: jwksClient.JwksClient;

  constructor() {
    const jwksUrl =
      process.env.JWKS_URL || 'https://example.com/.well-known/jwks.json';
    this.client = jwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      await this.validateToken(token);
      return true;
    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.substring(7);
  }

  private async validateToken(token: string): Promise<void> {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || !decoded.header.kid) {
      throw new Error('Invalid token format');
    }

    const key = await this.getSigningKey(decoded.header.kid);

    jwt.verify(token, key, {
      algorithms: ['RS256'],
    });
  }

  private async getSigningKey(kid: string): Promise<string> {
    const key = await this.client.getSigningKey(kid);
    return key.getPublicKey();
  }
}

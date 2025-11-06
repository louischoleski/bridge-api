import * as jwt from 'jsonwebtoken';
import { loadEnvironmentConfig } from '~config/environment';

const config = loadEnvironmentConfig();

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

/**
 * JWT Service for token generation and verification
 */
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret?: string, expiresIn?: string) {
    this.secret = secret || config.jwtSecret;
    this.expiresIn = expiresIn || config.jwtExpiresIn;
  }

  /**
   * Generate a JWT token
   */
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload as object, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.secret) as DecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): DecodedToken | null {
    return jwt.decode(token) as DecodedToken | null;
  }
}

// Export singleton instance
export const jwtService = new JwtService();

import { IUserRepository } from '~domain/user/repositories/user.repository.interface';
import { jwtService } from '~infrastructure/auth/jwt.service';

export interface LoginUseCaseInput {
  email: string;
  password: string;
}

export interface LoginUseCaseOutput {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

/**
 * Login Use Case
 * Handles user authentication and JWT token generation
 */
export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (!user.verifyPassword(password)) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }
}

import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { KNEX_CONNECTION } from '../../config/knex.provider';
import { Knex } from 'knex';
import { User, UserWithoutPassword } from '../users/users.interface';
import { v4 as uuidv4 } from 'uuid';
import { UserResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly jwtService: JwtService,
  ) {}

  // Helper method to transform database user to response format
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  generateToken(user: UserWithoutPassword): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async register(body: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const existing = await this.knex<User>('users')
      .where({ email: body.email })
      .first();

    if (existing) throw new ConflictException('User already exists');

    const hashed = await bcrypt.hash(body.password, 10);
    const userId = uuidv4();
    const walletId = uuidv4();

    const user = await this.knex.transaction(async (trx) => {
      await trx<User>('users').insert({
        id: userId,
        email: body.email,
        password: hashed,
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone,
      });

      await trx('wallets').insert({
        id: walletId,
        user_id: userId,
        balance: 0,
        currency: 'NGN',
      });

      return trx<User>('users').where({ id: userId }).first();
    });

    if (!user) throw new InternalServerErrorException('User creation failed');

    const accessToken = this.generateToken(user);

    return {
      message: 'Registration successful',
      data: { accessToken, user: this.toResponseDto(user) },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.knex<User>('users').where({ email }).first();
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  login(user: UserWithoutPassword) {
    const accessToken = this.generateToken(user);
    return {
      message: 'Login successful',
      accessToken,
    };
  }
}

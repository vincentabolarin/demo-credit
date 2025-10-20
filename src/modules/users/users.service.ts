import { Injectable, Inject } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { KNEX_CONNECTION } from '../../config/knex.provider';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { User } from './users.interface';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

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

  async create(body: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<UserResponseDto> {
    const existing = await this.knex<User>('users')
      .where({ email: body.email })
      .first();

    if (existing) throw new Error('User already exists');

    const hashed = await bcrypt.hash(body.password, 10);
    const userId = uuidv4();
    const walletId = uuidv4();

    const user = await this.knex.transaction(async (trx) => {
      await trx<User>('users').insert({
        id: userId,
        email: body.email,
        password: hashed,
        first_name: body.first_name,
        last_name: body.last_name,
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

    if (!user) throw new Error('User creation failed');

    return this.toResponseDto(user);
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { KNEX_CONNECTION } from '../../config/knex.provider';
import { Knex } from 'knex';
import { UsersResponseDataDto } from './dto/users-response.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private toResponseDto(user: UserWithoutPassword): UsersResponseDataDto {
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

  async getUsers(query: GetUsersQueryDto) {
    const { page, size, q } = query;
    const pageValue = Math.max(1, Number(page) || 1);
    const sizeValue = Math.min(100, Math.max(1, Number(size) || 10));

    let baseQuery = this.knex<UserWithoutPassword>('users');

    if (q) {
      const searchTerm = `%${q.toLowerCase()}%`;
      baseQuery = baseQuery.where(function () {
        this.whereRaw('LOWER(email) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(first_name) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(last_name) LIKE ?', [searchTerm]);
      });
    }

    const totalResult = await baseQuery
      .clone()
      .count<{ count: string }>({ count: 'id' })
      .first();
    const total = Number(totalResult?.count || 0);

    const users = await baseQuery
      .clone()
      .orderBy('created_at', 'desc')
      .limit(sizeValue)
      .offset((pageValue - 1) * sizeValue);

    const transformedUsers = users.map((user) => this.toResponseDto(user));

    const meta = {
      page: pageValue,
      size: sizeValue,
      total,
    };

    return {
      message: 'Users fetched successfully',
      data: transformedUsers,
      meta,
    };
  }

  async getUserById(id: string): Promise<UsersResponseDataDto> {
    const user = await this.knex<UserWithoutPassword>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return this.toResponseDto(user);
  }
}

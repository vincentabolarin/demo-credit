import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import {
  UsersResponseDataDto,
  UsersResponseDto,
} from './dto/users-response.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of all users' })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
    type: UsersResponseDto,
  })
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by their ID' })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    type: UsersResponseDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
    const response = await this.usersService.getUserById(id);
    return response;
  }
}

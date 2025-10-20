import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in to get JWT token' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new BadRequestException('Invalid credentials');
    const response = this.authService.login(user);
    return response;
  }
}

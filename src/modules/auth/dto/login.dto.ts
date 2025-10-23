import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email',
    example: 'vincent@maildrop.cc',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'First name',
    example: 'Vincent',
  })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Abolarin',
  })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'Email',
    example: 'vincent@maildrop.cc',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

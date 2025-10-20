import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'vincent@maildrop.cc' })
  email: string;

  @ApiProperty({ example: 'Vincent' })
  firstName: string;

  @ApiProperty({ example: 'Abolarin' })
  lastName: string;

  @ApiProperty({ example: '08012345678', required: false })
  phone?: string;

  @ApiProperty({ example: '2025-01-19T10:30:00Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-01-19T10:30:00Z' })
  updatedAt?: Date;
}

class RegisterResponseDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'Registration successful' })
  message: string;

  @ApiProperty({
    type: () => RegisterResponseDataDto,
  })
  data: RegisterResponseDataDto;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}

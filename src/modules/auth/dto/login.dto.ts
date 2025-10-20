import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'First name',
    example: 'Vincent',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Abolarin',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

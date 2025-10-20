import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

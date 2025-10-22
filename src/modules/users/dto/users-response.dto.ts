import { ApiProperty } from '@nestjs/swagger';

export class UsersResponseDataDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'vincent@maildrop.cc' })
  email: string;

  @ApiProperty({ example: 'Vincent' })
  firstName: string;

  @ApiProperty({ example: 'Abolarin' })
  lastName: string;

  @ApiProperty({ example: '08012345678' })
  phone: string;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  updatedAt?: Date;
}

export class UsersResponseDto {
  @ApiProperty({ example: 'Users fetched successfully' })
  message: string;

  @ApiProperty({ type: () => UsersResponseDataDto })
  data: UsersResponseDataDto;
}

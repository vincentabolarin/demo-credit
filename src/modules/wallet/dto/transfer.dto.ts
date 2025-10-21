import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'To User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  toUserId!: string;

  @ApiProperty({
    description: 'Amount',
    example: 100.0,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

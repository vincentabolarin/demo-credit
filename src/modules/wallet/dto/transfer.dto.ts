import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'To User ID',
    example: 'abc123',
  })
  @IsNumber()
  toUserId!: number;

  @ApiProperty({
    description: 'Amount',
    example: 100.0,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

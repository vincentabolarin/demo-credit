import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    description: 'Amount',
    example: 100.0,
  })
  @IsNumber()
  @Min(100.0)
  amount!: number;
}

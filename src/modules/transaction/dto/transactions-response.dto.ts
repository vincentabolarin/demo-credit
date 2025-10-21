import { ApiProperty } from '@nestjs/swagger';

export class TransactionsResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'FUND-123e4567-e89b-12d3-a456-426614174000' })
  reference: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  fromWalletId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  toWalletId: string;

  @ApiProperty({ example: 100.0 })
  amount: number;

  @ApiProperty({ example: 'FUNDING' })
  type: 'FUNDING' | 'WITHDRAWAL' | 'TRANSFER';

  @ApiProperty({ example: 'source: api' })
  meta: string;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  updatedAt?: Date;
}

export class MyTransactionsResponseDto {
  @ApiProperty({ example: 'Transactions fetched successfully' })
  message: string;

  @ApiProperty({ type: () => TransactionsResponseDto })
  data: TransactionsResponseDto;
}

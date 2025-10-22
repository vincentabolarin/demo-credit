import { ApiProperty } from '@nestjs/swagger';
import { TransactionUserDto } from './transaction-user.dto';
import { TransactionUser } from '../interfaces/transactions.interface';

export class TransactionsResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'FUND-123e4567-e89b-12d3-a456-426614174000' })
  reference: string;

  @ApiProperty({ type: () => TransactionUserDto, nullable: true })
  fromUser: TransactionUser | null;

  @ApiProperty({ type: () => TransactionUserDto, nullable: true })
  toUser: TransactionUser | null;

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

import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 100.0 })
  balance: number;

  @ApiProperty({ example: 'NGN' })
  currency: string;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-10-20T10:30:00Z' })
  updatedAt?: Date;
}

export class MyWalletResponseDto {
  @ApiProperty({ example: 'Wallet fetched successfully' })
  message: string;

  @ApiProperty({ type: () => WalletResponseDto })
  data: WalletResponseDto;
}

export class FundResponseDto {
  @ApiProperty({ example: 'Wallet funded successfully' })
  message: string;

  @ApiProperty({ type: () => WalletResponseDto })
  data: WalletResponseDto;
}

export class WithdrawResponseDto {
  @ApiProperty({ example: 'Withdrawal successful' })
  message: string;

  @ApiProperty({ type: () => WalletResponseDto })
  data: WalletResponseDto;
}

export class TransferResponseDto {
  @ApiProperty({ example: 'Transfer successful' })
  message: string;

  @ApiProperty({ type: () => WalletResponseDto })
  data: WalletResponseDto;
}

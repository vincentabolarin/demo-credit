import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FundDto } from './dto/fund.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { type User } from '../auth/interfaces/user.interface';
import {
  FundResponseDto,
  MyWalletResponseDto,
  TransferResponseDto,
  WithdrawResponseDto,
} from './dto/wallet-response.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Wallets')
@Controller('wallets')
@ApiBearerAuth()
@Throttle({ default: { limit: 1, ttl: 3000 } })
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Get('mine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch wallet of logged in user' })
  @ApiResponse({
    status: 200,
    description: 'Wallet fetched successfully',
    type: MyWalletResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wallet not found',
  })
  async mine(@CurrentUser() user: User) {
    console.log('user', user);
    const response = await this.walletService.getWalletByUserId(user.id);
    return response;
  }

  @Post('fund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fund wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet funded successfully',
    type: FundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wallet not found',
  })
  async fund(@CurrentUser() user: User, @Body() body: FundDto) {
    const response = await this.walletService.fund(user.id, body.amount);
    return response;
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw from wallet' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal successful',
    type: WithdrawResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wallet not found',
  })
  async withdraw(@CurrentUser() user: User, @Body() body: WithdrawDto) {
    const response = await this.walletService.withdraw(user.id, body.amount);
    return response;
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer' })
  @ApiResponse({
    status: 200,
    description: 'Transfer successful',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wallet not found',
  })
  async transfer(@CurrentUser() user: User, @Body() body: TransferDto) {
    return this.walletService.transfer(user.id, body.toUserId, body.amount);
  }
}

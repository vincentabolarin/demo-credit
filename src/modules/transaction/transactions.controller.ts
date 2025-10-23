// src/transactions/transactions.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { type FormattedUser } from '../auth/interfaces/user.interface';
import { MyTransactionsResponseDto } from './dto/transactions-response.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch transactions of logged in user' })
  @ApiResponse({
    status: 200,
    description: 'Transactions fetched successfully',
    type: MyTransactionsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transactions not found',
  })
  async getMyTransactions(
    @CurrentUser() user: FormattedUser,
    @Query() query: GetTransactionsQueryDto,
  ) {
    const response = this.transactionsService.getTransactionsForUser(
      user.id,
      query,
    );

    return response;
  }
}

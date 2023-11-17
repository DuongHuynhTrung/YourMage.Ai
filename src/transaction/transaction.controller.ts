import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/user/enum/role.enum';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';

@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Create Transaction' })
  @ApiOkResponse({
    description: 'Transaction object as response',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User is Inactive.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.USER)
  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @ApiOperation({ summary: 'Get All Transaction' })
  @ApiOkResponse({
    description: 'Return all transactions',
    type: [Transaction],
  })
  @ApiNotFoundResponse({
    description: 'Have no transaction',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Get()
  findAll(@Query('page') page: number): Promise<Transaction[]> {
    return this.transactionService.getTransactions(page);
  }

  @ApiOperation({ summary: 'Upgrade User Level by email' })
  @ApiOkResponse({
    type: [Transaction],
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiNotFoundResponse({
    description: '`Transaction with id not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiBadRequestResponse({
    description: 'Level is not supported.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch('/confirmTransaction')
  confirmTransaction(
    @Body() confirmTransactionDto: ConfirmTransactionDto,
  ): Promise<Transaction[]> {
    return this.transactionService.confirmTransaction(confirmTransactionDto);
  }
}

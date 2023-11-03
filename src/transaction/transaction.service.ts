import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PaymentStatus } from './enum/payment-status.enum';
import { LevelEnum } from 'src/user/enum/level.enum';
import { TokensEnum } from 'src/user/enum/tokens.enum';
import { User } from 'src/user/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly userService: UserService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = this.userService
      .getUserByEmail(createTransactionDto.email)
      .then((user) => {
        if (!user) {
          throw new NotFoundException(
            `User ${createTransactionDto.email} not found`,
          );
        }
        if (!user.status) {
          throw new BadRequestException(`User is Inactive`);
        }
      });
    const transaction = this.transactionRepository.create(createTransactionDto);
    if (!transaction) {
      throw new InternalServerErrorException(
        'Something went wrong when creating transaction',
      );
    }
    try {
      transaction.paymentStatus = PaymentStatus.PENDING;
      await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong when saving transaction',
        error.message,
      );
    }
    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    try {
      const transactions = await this.transactionRepository.find();
      if (!transactions || transactions.length === 0) {
        throw new NotFoundException(`Have no transactions`);
      }
      return transactions;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async confirmTransaction(
    confirmTransactionDto: ConfirmTransactionDto,
  ): Promise<string> {
    const transactionId = ObjectId.createFromHexString(
      confirmTransactionDto.transactionId,
    );
    let transaction: Transaction = null;
    try {
      transaction = await this.transactionRepository.findOne({
        where: {
          _id: transactionId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!transaction || transaction === null) {
      throw new NotFoundException(
        `Transaction with id ${transactionId} not found`,
      );
    }
    transaction.paymentStatus = PaymentStatus.COMPLETED;
    let user: User = null;
    try {
      user = await this.userService.getUserByEmail(transaction.email);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!user || user === null) {
      throw new NotFoundException(`User ${transaction.email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    try {
      await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(
        `Something went wrong when updating transaction status`,
      );
    }
    user.level = transaction.level;
    switch (transaction.level) {
      case LevelEnum.APPRENTICE:
        user.tokens = TokensEnum.APPRENTICE;
        break;
      case LevelEnum.ARTISAN:
        user.tokens = TokensEnum.ARTISAN;
        break;
      case LevelEnum.MAESTRO:
        user.tokens = TokensEnum.MAESTRO;
        break;
      default:
        throw new Error(`Level ${transaction.level} not supported`);
    }
    user.upgradeLevelAt = new Date();
    try {
      const userUpgraded = this.userService.updateUser(user);
      if (!userUpgraded) {
        throw new Error(
          `Something went wrong when updating user level: ${transaction.level}`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'User upgrade successfully';
  }
}

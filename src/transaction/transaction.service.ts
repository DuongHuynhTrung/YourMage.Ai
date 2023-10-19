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
}

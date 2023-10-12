import { UpdateInterestsDto } from './dto/update-interests.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LevelEnum } from './enum/level.enum';
import { TokensEnum } from './enum/tokens.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly socketGateway: SocketGateway, // Inject SocketGateway
  ) {}

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({
        email,
      });
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async upgradeLevelUser(email: string, level: LevelEnum): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      user.level = level;
      switch (level) {
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
          throw new Error(`Level ${level} not supported`);
      }
      user.upgradeLevelAt = new Date();
      const userUpgraded = await this.userRepository.save(user);
      if (!userUpgraded) {
        throw new Error(
          `Something went wrong when updating user level: ${level}`,
        );
      }
      return 'User upgrade successfully';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTokensWhenGenerate(email: string): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      user.tokens = user.tokens - 20;
      const updateNewTokens = await this.userRepository.save(user);
      if (!updateNewTokens) {
        throw new Error(
          `Something went wrong when updating new tokens after generating`,
        );
      }
      this.socketGateway.handleUpdateTokens({
        userId: user.email,
        tokens: user.tokens,
      });
      return 'Updated Tokens successfully';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeUserName(email: string, userName: string): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,15}$/;
      if (!USERNAME_REGEX.test(userName)) {
        throw new Error(`UserName is not following regex pattern`);
      }
      user.userName = userName;
      const updateUserName = await this.userRepository.save(user);
      if (!updateUserName) {
        throw new Error(`Something went wrong when changing user name`);
      }
      return 'UserName has been changed';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeInterests(
    email: string,
    updateInterestsDto: UpdateInterestsDto,
  ): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      user.interests = updateInterestsDto.interests;
      const updateInterests = await this.userRepository.save(user);
      if (!updateInterests) {
        throw new Error(`Something went wrong when changing user name`);
      }
      return 'Interests has been updated';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeIsOlder18(email: string, isOlder18: boolean): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      user.isOlder18 = isOlder18;
      const updateIsOlder18 = await this.userRepository.save(user);
      if (!updateIsOlder18) {
        throw new Error(`Something went wrong when changing user name`);
      }
      return 'IsOlder18 has been updated';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteUser(email: string): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error(`User ${email} not found`);
      }
      if (!user.status) {
        throw new Error(`User status is ${user.status}`);
      }
      const deleteUser = await this.userRepository.delete({ email });
      if (!deleteUser) {
        throw new InternalServerErrorException(
          'Something went wrong when deleting user',
        );
      }
      if (deleteUser.affected > 0) {
        return 'Delete user successfully';
      } else {
        return 'Delete user failed';
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleUpdateTokens() {
    const today = new Date();

    const users = await this.userRepository.find();
    for (const user of users) {
      if (user.level === LevelEnum.FREE) {
        user.tokens = TokensEnum.FREE;

        await this.userRepository.save(user);

        this.socketGateway.handleUpdateTokens({
          userId: user.email,
          tokens: user.tokens,
        });
      } else if (
        user.upgradeLevelAt &&
        user.upgradeLevelAt.getDate === today.getDate
      ) {
        switch (user.level) {
          case LevelEnum.APPRENTICE:
            user.tokens = TokensEnum.APPRENTICE;
            break;
          case LevelEnum.ARTISAN:
            user.tokens = TokensEnum.ARTISAN;
            break;
          case LevelEnum.MAESTRO:
            user.tokens = TokensEnum.MAESTRO;
            break;
        }

        await this.userRepository.save(user);

        this.socketGateway.handleUpdateTokens({
          userId: user.email,
          tokens: user.tokens,
        });
      }
    }
  }
}

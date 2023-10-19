import { UpdateInterestsDto } from './dto/update-interests.dto';
import {
  BadRequestException,
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
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
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
    try {
      const userUpgraded = await this.userRepository.save(user);
      if (!userUpgraded) {
        throw new Error(
          `Something went wrong when updating user level: ${level}`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'User upgrade successfully';
  }

  async updateTokensWhenGenerate(email: string): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    user.tokens = user.tokens - 20;
    try {
      const updateNewTokens = await this.userRepository.save(user);
      if (!updateNewTokens) {
        throw new Error(
          `Something went wrong when updating new tokens after generating`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    this.socketGateway.handleUpdateTokens({
      userId: user.email,
      tokens: user.tokens,
    });
    return 'Updated Tokens successfully';
  }

  async changeUserName(email: string, userName: string): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,15}$/;
    if (!USERNAME_REGEX.test(userName)) {
      throw new BadRequestException(`UserName is not following regex pattern`);
    }
    user.userName = userName;
    try {
      const updateUserName = await this.userRepository.save(user);
      if (!updateUserName) {
        throw new Error(`Something went wrong when changing user name`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'UserName has been changed';
  }

  async changeInterests(
    email: string,
    updateInterestsDto: UpdateInterestsDto,
  ): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    user.interests = updateInterestsDto.interests;
    try {
      const updateInterests = await this.userRepository.save(user);
      if (!updateInterests) {
        throw new Error(`Something went wrong when changing user name`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'Interests has been updated';
  }

  async changeIsOlder18(email: string, isOlder18: boolean): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    user.isOlder18 = isOlder18;
    try {
      const updateIsOlder18 = await this.userRepository.save(user);
      if (!updateIsOlder18) {
        throw new Error(`Something went wrong when changing user name`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'IsOlder18 has been updated';
  }

  async deleteUser(email: string): Promise<string> {
    let user = null;
    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    try {
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

    try {
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

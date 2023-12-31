import { HistoryImageGenerateDto } from './dto/history-image-generate.dto';
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

  async getUsers(page: number, level: string): Promise<User[]> {
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    switch (level) {
      case 'All': {
        try {
          let users = await this.userRepository.find();
          if (!users || users.length === 0) {
            return [];
          }
          users = users.filter((user) => user.email !== 'admin@gmail.com');
          return users.slice(startIndex, endIndex);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.FREE: {
        try {
          let users = await this.userRepository.find({
            where: {
              level: LevelEnum.FREE,
            },
          });
          if (!users || users.length === 0) {
            return [];
          }
          users = users.filter((user) => user.email !== 'admin@gmail.com');
          let noNumber = 1;
          users.forEach((user) => {
            user.no = noNumber;
            noNumber++;
          });
          return users.slice(startIndex, endIndex);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.APPRENTICE: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.APPRENTICE,
            },
          });
          if (!users || users.length === 0) {
            return [];
          }
          let noNumber = 1;
          users.forEach((user) => {
            user.no = noNumber;
            noNumber++;
          });
          return users.slice(startIndex, endIndex);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.ARTISAN: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.ARTISAN,
            },
          });
          if (!users || users.length === 0) {
            return [];
          }
          let noNumber = 1;
          users.forEach((user) => {
            user.no = noNumber;
            noNumber++;
          });
          return users.slice(startIndex, endIndex);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.MAESTRO: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.MAESTRO,
            },
          });
          if (!users || users.length === 0) {
            return [];
          }
          let noNumber = 1;
          users.forEach((user) => {
            user.no = noNumber;
            noNumber++;
          });
          return users.slice(startIndex, endIndex);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
    }
  }

  async getTotalUser(level: string): Promise<number> {
    switch (level) {
      case 'All': {
        try {
          const users = await this.userRepository.find();
          if (!users || users.length === 0) {
            throw new NotFoundException('Have no users in the repository');
          }
          return users.length - 1;
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.FREE: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.FREE,
            },
          });
          return users.length - 1;
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.APPRENTICE: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.APPRENTICE,
            },
          });
          return users.length;
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.ARTISAN: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.ARTISAN,
            },
          });
          return users.length;
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
      case LevelEnum.MAESTRO: {
        try {
          const users = await this.userRepository.find({
            where: {
              level: LevelEnum.MAESTRO,
            },
          });
          return users.length;
        } catch (error) {
          throw new NotFoundException(error.message);
        }
        break;
      }
    }
  }

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
    return user;
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

  async historyImageGenerate(
    user: User,
    historyImageGenerateDto: HistoryImageGenerateDto,
  ): Promise<User> {
    if (user.historyImageGenerated != undefined) {
      user.historyImageGenerated.push(historyImageGenerateDto);
    } else {
      user.historyImageGenerated = [historyImageGenerateDto];
    }

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return user;
  }

  async updateUser(user: User) {
    try {
      const userUpgraded = await this.userRepository.save(user);
      if (!userUpgraded) {
        throw new Error(`Something went wrong when saving user`);
      }
      return true;
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

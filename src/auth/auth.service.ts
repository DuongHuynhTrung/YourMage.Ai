import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { MongoRepository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { PayloadJwtDto } from './dto/payload-jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInGoogleDto } from './dto/sign-in-google.dto';
import { LevelEnum } from 'src/user/enum/level.enum';
import { OAuth2Client } from 'google-auth-library';
import { RoleEnum } from 'src/user/enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    private jwtService: JwtService,
  ) {}

  async loginGoogleUser(token: string): Promise<{ accessToken: string }> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const client = new OAuth2Client(clientId, clientSecret);
      const tokenInfo = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const googlePayload = tokenInfo.getPayload();
      const user = await this.userRepository.findOneBy({
        email: googlePayload.email,
      });
      if (user) {
        const payload: PayloadJwtDto = {
          userName: user.userName,
          email: user.email,
          level: user.level,
          interests: user.interests,
          isOlder18: user.isOlder18,
          tokens: user.tokens,
          status: user.status,
          role: user.role,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      } else {
        const user = this.userRepository.create({
          email: googlePayload.email,
          isOlder18: false,
          level: LevelEnum.FREE,
          tokens: 150,
          status: true,
          role: RoleEnum.USER,
        });
        if (!user) {
          throw new BadRequestException(
            'Something went wrong when creating the user',
          );
        }

        await this.userRepository.save(user);

        const payload: PayloadJwtDto = {
          userName: user.userName,
          email: user.email,
          level: user.level,
          interests: user.interests,
          isOlder18: user.isOlder18,
          tokens: user.tokens,
          status: user.status,
          role: user.role,
          isNewUser: true,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;
    if (!PASSWORD_REGEX.test(signUpDto.password)) {
      throw new BadRequestException(
        'Password is not following the regex pattern',
      );
    }
    try {
      const isExist = await this.userRepository.findOneBy({
        email: signUpDto.email,
      });
      if (isExist) {
        throw new BadRequestException(
          `User with email ${signUpDto.email} already exists`,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const user = this.userRepository.create(signUpDto);
    if (!user) {
      throw new BadRequestException('Something went wrong when creating user');
    }
    user.isOlder18 = false;
    user.level = LevelEnum.FREE;
    user.tokens = 150;
    user.status = false;
    user.role = RoleEnum.USER;
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(signUpDto.password, salt);

      await this.userRepository.save(user);
      return 'Sign up successfully';
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email has already existed');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    let user = null;
    try {
      user = await this.userRepository.findOneBy({
        email: signInDto.email,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(`User ${signInDto.email} does not exist`);
    }
    if (!user.status) {
      throw new BadRequestException(`User status is ${user.status}`);
    }
    try {
      const checkPassword = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      if (!checkPassword) {
        throw new Error('Invalid password');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const payload: PayloadJwtDto = {
      userName: user.userName,
      email: user.email,
      level: user.level,
      interests: user.interests,
      isOlder18: user.isOlder18,
      tokens: user.tokens,
      status: user.status,
      role: user.role,
      isNewUser: false,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signInGoogle(
    signInGoogleDto: SignInGoogleDto,
  ): Promise<{ accessToken: string }> {
    try {
      const isExist = await this.userRepository.findOneBy({
        email: signInGoogleDto.email,
      });
      if (isExist) {
        const payload: PayloadJwtDto = {
          userName: isExist.userName,
          email: isExist.email,
          level: isExist.level,
          interests: isExist.interests,
          isOlder18: isExist.isOlder18,
          tokens: isExist.tokens,
          status: isExist.status,
          role: isExist.role,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
      } else {
        const user = this.userRepository.create(signInGoogleDto);
        if (!user) {
          throw new InternalServerErrorException(
            'Something went wrong when creating user',
          );
        }
        user.status = true;
        await this.userRepository.save(user);

        const payload: PayloadJwtDto = {
          userName: isExist.userName,
          email: isExist.email,
          level: isExist.level,
          interests: isExist.interests,
          isOlder18: isExist.isOlder18,
          tokens: isExist.tokens,
          status: isExist.status,
          role: isExist.role,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleVerifyToken(token) {
    try {
      const payload = this.jwtService.verify(token); // this.configService.get('SECRETKEY')
      return payload['email'];
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}

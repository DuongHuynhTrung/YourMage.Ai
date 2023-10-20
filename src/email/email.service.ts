import { JwtService } from '@nestjs/jwt';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/user/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterOtpDto } from './dto/register-otp.dto';
import * as moment from 'moment';
import { PayloadJwtDto } from 'src/auth/dto/payload-jwt.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,

    private jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendOtpWhenRegister(registerOtpDto: RegisterOtpDto) {
    let userEmailAvailable = null;
    try {
      userEmailAvailable = await this.userRepository.findOneBy({
        email: registerOtpDto.email,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!userEmailAvailable) {
      throw new NotFoundException(
        `User ${registerOtpDto.email} does not exist`,
      );
    }
    if (userEmailAvailable.status) {
      throw new BadRequestException(
        `User with email ${registerOtpDto.email} is already available`,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpired = new Date();
    try {
      await this.mailerService.sendMail({
        to: registerOtpDto.email,
        subject: 'Verify OTP when registering',
        html: `<body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
                <table
                  align="center"
                  role="presentation"
                  cellSpacing="0"
                  cellPadding="0"
                  border="0"
                  width="100%"
                  style="max-width:37.5em;background-color:#ffffff;border:1px solid #eee;border-radius:5px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;width:360px;margin:0 auto;padding:68px 0 130px"
                >
                  <tr style="width:100%">
                    <td>
                      <img
                        alt="Plaid"
                        src="https://live.staticflickr.com/65535/53245123847_c6c0061968_k.jpg"
                        width="150"
                        height="auto"
                        style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto"
                      />
                      <p style="font-size:11px;line-height:16px;margin:16px 8px 8px 8px;color:#0a85ea;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;text-transform:uppercase;text-align:center">
                        Verify Your Email
                      </p>
                      <h1 style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center">
                        Enter the following code to finish create account
                      </h1>
                      <table
                        style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px"
                        align="center"
                        border="0"
                        cellPadding="0"
                        cellSpacing="0"
                        role="presentation"
                        width="100%"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <p style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">
                                ${otp}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                        Not expecting this email?
                      </p>
                      <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                        Contact
                        <a
                          target="_blank"
                          style="color:#444;text-decoration:underline"
                          href="mailto:yourmageai@gmail.com.com"
                        >
                          yourmageai@gmail.com
                        </a>
                        if you did not request this code.
                      </p>
                    </td>
                  </tr>
                </table>
              </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { otpStored: otp, otpExpired };
  }

  async forgotPassword(registerOtpDto: RegisterOtpDto) {
    let userEmailAvailable = null;
    try {
      userEmailAvailable = await this.userRepository.findOneBy({
        email: registerOtpDto.email,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!userEmailAvailable) {
      throw new NotFoundException(
        `User ${registerOtpDto.email} does not exist`,
      );
    }
    if (!userEmailAvailable.status) {
      throw new BadRequestException(
        `User with email ${registerOtpDto.email} status is false`,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpired = new Date();
    try {
      await this.mailerService.sendMail({
        to: registerOtpDto.email,
        subject: 'Reset Password OTP',
        html: `<body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
        <table
          align="center"
          role="presentation"
          cellSpacing="0"
          cellPadding="0"
          border="0"
          width="100%"
          style="max-width:37.5em;background-color:#ffffff;border:1px solid #eee;border-radius:5px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;width:360px;margin:0 auto;padding:68px 0 130px"
        >
          <tr style="width:100%">
            <td>
              <img
                alt="Plaid"
                src="https://live.staticflickr.com/65535/53245123847_c6c0061968_k.jpg"
                width="150"
                height="auto"
                style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto"
              />
              <p style="font-size:11px;line-height:16px;margin:16px 8px 8px 8px;color:#0a85ea;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;text-transform:uppercase;text-align:center">
                Verify Your Email
              </p>
              <h1 style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center">
                Enter the following code to finish reset your password
              </h1>
              <table
                style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px"
                align="center"
                border="0"
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                width="100%"
              >
                <tbody>
                  <tr>
                    <td>
                      <p style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">
                        ${otp}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                Not expecting this email?
              </p>
              <p style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                Contact
                <a
                  target="_blank"
                  style="color:#444;text-decoration:underline"
                  href="mailto:yourmageai@gmail.com.com"
                >
                  yourmageai@gmail.com
                </a>
                if you did not request this code.
              </p>
            </td>
          </tr>
        </table>
      </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { otpStored: otp, otpExpired };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string }> {
    const { otp, otpExpired, otpStored, email } = verifyOtpDto;
    if (otpStored !== otp) {
      throw new BadRequestException('Wrong OTP! Please try again');
    }
    const currentTime = moment(new Date());
    const otpExpires = moment(otpExpired);
    const isExpired = currentTime.diff(otpExpires, 'minutes');
    if (isExpired > 10) {
      throw new BadRequestException('OTP is expired! Please try again');
    }
    let user = null;
    try {
      user = await this.userRepository.findOneBy({ email });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new BadRequestException('User not found! Please try again');
    }
    user.status = true;
    let updateUserStatus = null;
    try {
      updateUserStatus = await this.userRepository.save(user);
      if (!updateUserStatus) {
        throw new InternalServerErrorException(
          'Something went wrong updating the status of the user',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    const payload: PayloadJwtDto = {
      userName: updateUserStatus.userName,
      email: updateUserStatus.email,
      level: updateUserStatus.level,
      interests: updateUserStatus.interests,
      isOlder18: updateUserStatus.isOlder18,
      tokens: updateUserStatus.tokens,
      status: updateUserStatus.status,
      role: updateUserStatus.role,
      isNewUser: false,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}

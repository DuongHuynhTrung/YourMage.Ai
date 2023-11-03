import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SocketGateway } from 'socket.gateway';
import { TransactionModule } from './transaction/transaction.module';
import { ShareImageModule } from './share-image/share-image.module';
import { MessageModule } from './message/message.module';
import { MessageService } from './message/message.service';
import { Message } from './message/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get('DB_URI'),
        useNewUrlParser: true,
        logging: true,
        autoLoadEntities: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        // transport: config.get('MAIL_TRANSPORT'),
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"YourMage.Ai" <${config.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    EmailModule,
    TransactionModule,
    ShareImageModule,
    MessageModule,
  ],
  providers: [SocketGateway, MessageService],
})
export class AppModule {}

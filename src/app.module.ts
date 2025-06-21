import * as crypto from 'crypto';
import { Module, OnModuleInit } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { DelegateModule } from './modules/delegate/delegate.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Delegate } from './entities/delegate.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailingModule } from './integrations/mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RoleService } from './modules/roles/role.service';
import { RoleModule } from './modules/roles/role.module';
import { AuthController } from './modules/auth/auth.controller';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { Badge } from './entities/badge.entity';
import { EventOrganizer } from './entities/event-organizer.entity';
import { Speaker } from './entities/speaker.entity';
import { Workshop } from './entities/workshop.entity';
import { Coordinator } from './entities/coordinator.entity';
import { Event } from './entities/event.entity';
import { SpeakerModule } from './modules/speakers/speaker.module';
import { EventModule } from './modules/events/event.module';
import { WorkshopModule } from './modules/workshops/workshops.module';


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [
          User,
          Role,
          Delegate,
          Badge,
          Event,
          Coordinator,
          EventOrganizer,
          Speaker,
          Workshop,
        ],
        // ssl: {
        //   rejectUnauthorized: true,
        // },
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    JwtModule,
    UsersModule,
    RoleModule,
    MailingModule,
    AuthModule,
    DelegateModule,
    SpeakerModule,
    EventModule,
    WorkshopModule,
  ],
  controllers: [AuthController],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements OnModuleInit {
  
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {

    let roles = await this.roleService.getAllRoles();
    if (!roles || roles.length == 0) {
      this.roleService.createRoles();
    }
  }
}

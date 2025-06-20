
/**
 * @file
 * @brief module for auth queries
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UtilsModule } from '../utils/utils.module';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UtilsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}

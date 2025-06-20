import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/modules/users/users.module';
import { UtilsService } from './utils.service';

@Module({
  imports: [forwardRef(() => UsersModule), JwtModule, ConfigModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}

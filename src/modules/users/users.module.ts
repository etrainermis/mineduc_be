/* eslint-disable */
/*
 @auhor : © 2024 Alice Umugwaneza <umugwanezaalice22@gmail.com>
*/

/**
 * @file
 * @brief file for user module
 */
import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UtilsModule } from '../utils/utils.module';
import { User } from 'src/entities/user.entity';
import { RoleModule } from '../roles/role.module';
@Global()
@Module({
  controllers: [UsersController],
  
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    UtilsModule
  ],
  providers: [UsersService,JwtService],
  exports: [UsersService],
})
export class UsersModule {}
// {provide:APP_GUARD, useClass:RolesGuard}

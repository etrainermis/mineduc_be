/* eslint-disable */
/*
 @auhor : © 2025 Alice Umugwaneza <umugwanezaalice22@gmail.com>
*/

/**
 * @file
 * @brief module for role queries
 */
import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/users/users.module';
import { Role } from 'src/entities/role.entity';

@Module({
  providers: [RoleService],
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => UsersModule)],
  exports: [RoleService],
})
export class RoleModule {}

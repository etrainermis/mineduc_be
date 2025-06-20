/* eslint-disable */
/*
 @auhor : © 2024  Alice Umugwaneza <umugwanezaalice22@gmail.com>
*/

/**
 * @file
 * @brief controller for user queries
 */
import {
  Controller,
  Param,
  Delete,
  Get,
  Body,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/common/dtos/update-user.dto';
import { CreateAdminDto } from 'src/common/dtos/create-admin.dto';
import {
  CreateUserByAdminDto,
  CreateUserDto,
} from 'src/common/dtos/create-user.dto';
import { Roles } from '../utils/decorators/roles.decorator';
import { Public } from '../utils/decorators/public.decorator';
import { ApiResponse } from 'src/common/payload/ApiResponse';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/all')
  @Roles('ADMIN','COORDINATOR','EVENT_ORGANIZER')
  getUsers() {
    return this.usersService.getUsers();
  }



  @Get('/:id')
  @Roles('ADMIN')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Public()
  @Post('/create/admin')
  @ApiBody({ type: CreateAdminDto })
  createAdminAccount(@Body() body: CreateAdminDto) {
    return this.usersService.createAdmin(body);
  }

  @Public()
  @Post('/create/user')
  @ApiBody({ type: CreateUserByAdminDto })
  @Roles('ADMIN')
  createUserAccount(@Body() body: CreateUserByAdminDto) {
    return this.usersService.createUser(body);
  }

  @Patch('update/:id')
  @Roles('ADMIN')
  @ApiBody({ type: UpdateUserDto })
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(id, body);
  }

  @Patch('/{assign-role}/:userId/:roleName/:userType')
  @Roles('ADMIN')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleName') roleName: any,
    @Param('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'The role has been assigned successfully',
      await this.usersService.assignRoleToUser(userId, roleName, userType),
    );
  }

  @Delete('delete/:id')
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}


/**
 * @file
 * @brief controller for auth queries
 */
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDTO } from 'src/common/dtos/login.dto';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcryptjs';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { VerifyAccountDTO } from 'src/common/dtos/verify-account.dto';
import { User } from 'src/entities/user.entity';
import { ResetPasswordDTO } from 'src/common/dtos/reset-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { Public } from '../utils/decorators/public.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth('JWT-auth')
export class AuthController {
  public isUserAvailable: User;
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDTO): Promise<ApiResponse> {
    this.isUserAvailable = await this.userService.getUserByEmailAndNotDelegate(dto.email);
    if (!this.isUserAvailable)
      throw new ForbiddenException('Invalid email or password');
    console.log(this.isUserAvailable);
    
    const arePasswordsMatch = await bcrypt.compare(
      dto.password.toString(),
      this.isUserAvailable.password.toString(),
    );
    if (!arePasswordsMatch)
      throw new BadRequestException('Invalid email or password');
    return new ApiResponse(
      true,
      'User loggedInSucccessfully',
      await this.userService.login(dto),
    );
  }
  @Put('verify_account')
  @Public()
  async VerifyAccount(@Body() dto: VerifyAccountDTO): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'Your account is verified successfully',
      await this.userService.verifyAccount(dto.verificationCode),
    );
  }
  @Get('get_code/:email')
  @Public()
  async getVerificationCode(
    @Param('email') email: string,
  ): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'We have sent a verification code to your email',
      await this.userService.getVerificationCode(email, true),
    );
  }
  @Get('get_reset_password_token/:email')
  @Public()
  async getResetPasswordToken(
    @Param('email') email: string,
  ): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'We have sent a reset password token',
      await this.userService.getResetPasswordToken(email, true),
    );
  }

  @Put('reset_password')
  @Public()
  async resetPassword(@Body() dto: ResetPasswordDTO): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'Your password was reset successfully ',
      await this.userService.resetPassword(dto.code, dto.newPassword),
    );
  }

  @Get('/get-profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: Request) {
    let profile = await this.authService.getProfile(req);
    return profile;
  }
}

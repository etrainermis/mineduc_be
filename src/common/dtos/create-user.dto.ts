/* eslint-disable */
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsEmail,
    IsStrongPassword
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../enums/ERole.enum';
import { BaseUserDto } from './base-user-dto';

export class CreateUserDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
export class CreateUserByAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  myGender: string;

  @ApiProperty({ enum: ERole })
  @IsEnum(ERole)
  role: ERole;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  national_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phonenumber: string;



}
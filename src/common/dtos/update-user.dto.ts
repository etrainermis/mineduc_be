/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { ERole } from '../enums/ERole.enum';
import { EGender } from '../enums/EGender.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  username: string;

  @ApiProperty({ enum: ERole })
  @IsEnum(ERole)
  @IsOptional()
  role: ERole;

  @IsString()
  @IsOptional()
  @IsEnum(EGender)
  @ApiProperty()
  gender: EGender;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nationalId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @IsPhoneNumber()
  phonenumber: string;
}

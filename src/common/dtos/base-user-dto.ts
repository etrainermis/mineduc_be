import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../enums/ERole.enum';

export class BaseUserDto {
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
  
    @ApiProperty({required: false})
    @IsOptional()
    national_id: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({required:false})
    @IsPhoneNumber()
    phonenumber: string;

 
  }
  
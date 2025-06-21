import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { EDelegateType } from '../enums/EDelegateType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { BaseUserDto } from './base-user-dto';
import { EEventType } from '../enums/EEventType.enum';
import { Transform, Type } from 'class-transformer';

export class CreateDelegateDto extends BaseUserDto {
  @IsEnum(EDelegateType)
  @ApiProperty()
  delegate_type: EDelegateType;

  @IsNotEmpty()
  @ApiProperty()
  country: string;

  @IsNotEmpty()
  @ApiProperty()
  partner_state: string;

  @IsNotEmpty()
  @ApiProperty()
  organization: string;

  @IsNotEmpty()
  @ApiProperty()
  position: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary', // This is what makes Swagger show file upload
    description: 'Profile picture (JPG, PNG)',
    required: false,
  })
  profile_picture_url?: any;

  @IsOptional()
  @ApiProperty()
  dietary_restrictions?: string;

  @IsOptional()
  @ApiProperty()
  special_needs?: string;

  @IsOptional()
  @ApiProperty()
  accommodation_status: string;

  @IsOptional()
  @ApiProperty()
  accommodation_details: string;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ type: String, format: 'date-time', required: false })
  arrival_datetime?: Date;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ type: String, format: 'date-time', required: false })
  departure_datetime?: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  airline?: string;

  @IsOptional()
  @IsEnum(EEventType)
  @ApiProperty({ enum: EEventType, required: false })
  selected_event?: EEventType;

  @ApiProperty({
    type: [String],
    description: 'Comma-separated UUIDs or repeated fields (depends on client)',
    example: [
      'a3f5c0b8-7b9d-4f3f-92c2-91cb5f6d3739',
      'd7a0b3f6-8a9f-4a4a-a1e6-9629f1ab4311',
    ],
    required: false,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((v) => v.trim())
      : Array.isArray(value)
        ? value
        : [],
  )
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  workshopIds?: string[];

  @IsOptional()
  @ApiProperty({ type: [String], required: false })
  selected_activities?: string[];

  @IsOptional()
  @ApiProperty({ type: [String], required: false })
  selected_round_tables?: string[];
}

export class UpdateDelegateDto {
  @IsOptional()
  @ApiProperty()
  @IsEnum(EDelegateType)
  delegate_type?: EDelegateType;

  @IsOptional()
  country?: string;

  @IsOptional()
  job_title?: string;

  @IsOptional()
  profile_picture?: string;

  @IsOptional()
  dietary_restrictions?: string;

  @IsOptional()
  special_needs?: string;

  @IsOptional()
  is_approved?: boolean;
}

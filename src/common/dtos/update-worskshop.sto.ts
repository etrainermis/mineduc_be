// src/common/dtos/update-workshop.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateWorkshopDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  eventId?: number; // Optional field, if the event needs to be updated.

  @IsInt()
  @IsOptional()
  eventOrganizerId?: number; // Optional field for updating the event organizer

  @IsString()
  @IsOptional()
  location?: string; // Optional field for location update

  @IsString()
  @IsOptional()
  schedule?: string; // Optional field for schedule update
}

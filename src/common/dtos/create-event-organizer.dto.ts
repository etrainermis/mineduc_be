import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateEventOrganizerDto {
  @IsString()
  userId: string; // Assuming the userId is provided for the EventOrganizer.

  @IsOptional()
  @IsInt()
  eventId?: number;  // Optional - when assigning an event directly to the organizer.
}

import { IsArray, IsInt } from 'class-validator';

export class AssignWorkshopToEventOrganizerDto {
  @IsArray()
  @IsInt({ each: true })
  workshopIds: number[];
}

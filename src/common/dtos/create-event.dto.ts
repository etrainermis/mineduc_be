import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2025',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Venue of the event',
    example: 'New York Convention Center',
  })
  @IsString()
  venue: string;

  @ApiProperty({
    description: 'Theme',
    example: 'green',
  })
  @IsString()
  theme: string;


  @ApiProperty({
    description: 'Schedule of the event',
    example: '2025-05-20T09:00:00Z',
  })
  @IsDateString()
  schedule: Date;


  @ApiProperty({
    description: 'Whether the event is published or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

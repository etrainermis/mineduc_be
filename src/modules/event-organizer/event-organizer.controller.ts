import { Body, Controller, Post } from '@nestjs/common';

import { EventOrganizerService } from './event-organizer.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventOrganizerDto } from 'src/common/dtos/create-event-organizer.dto';

@ApiTags('event-organizer')
@Controller('event-organizer')
export class EventOrganizerController {
  constructor(private readonly organizerService: EventOrganizerService) {}


}

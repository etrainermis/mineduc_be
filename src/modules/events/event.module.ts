import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from '../../entities/event.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { EventOrganizer } from 'src/entities/event-organizer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Workshop, EventOrganizer]), // Add the Workshop entity here
      ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

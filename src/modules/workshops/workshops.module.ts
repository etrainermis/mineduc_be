import { Module } from '@nestjs/common';
import { Workshop } from 'src/entities/workshop.entity';
import { Event } from 'src/entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopService } from './workshops.service';
import { WorkshopController } from './workshops.controller';
import { EventOrganizer } from 'src/entities/event-organizer.entity';
import { User } from 'src/entities/user.entity';
import { Speaker } from 'src/entities/speaker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop, Event, EventOrganizer, User, Speaker])],
  providers: [WorkshopService],
  controllers: [WorkshopController],
})
export class WorkshopModule {}

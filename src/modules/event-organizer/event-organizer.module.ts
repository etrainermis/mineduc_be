import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventOrganizer } from 'src/entities/event-organizer.entity';
import { EventOrganizerService } from './event-organizer.service';
import { EventOrganizerController } from './event-organizer.controller';
import { Role } from 'src/entities/role.entity';
import { UtilsService } from '../utils/utils.service';
import { RoleService } from '../roles/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventOrganizer, Role])],
  controllers: [EventOrganizerController],
  providers: [EventOrganizerService, UtilsService, RoleService],
})
export class EventOrganizerModule {}

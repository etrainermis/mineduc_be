import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventOrganizer } from 'src/entities/event-organizer.entity';
import { EAccountStatus } from 'src/common/enums/EAccountStatus.enum';
import { EGender } from 'src/common/enums/EGender.enum';
import { Role } from 'src/entities/role.entity';
import { UtilsService } from '../utils/utils.service';
import { RoleService } from '../roles/role.service';
import { CreateEventOrganizerDto } from 'src/common/dtos/create-event-organizer.dto';


@Injectable()
export class EventOrganizerService {
  constructor(
    @InjectRepository(EventOrganizer)
    private organizerRepo: Repository<EventOrganizer>,
    private utilsService: UtilsService,
    private roleService: RoleService,
  ) {}


}

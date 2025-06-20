// src/modules/workshop/workshop.controller.ts
import { Controller, Post, Put, Body, Param, Get, Delete } from '@nestjs/common';
import { Workshop } from 'src/entities/workshop.entity';
import { WorkshopService } from './workshops.service';
import { CreateWorkshopDto } from 'src/common/dtos/create-workshops-dto';
import { UpdateWorkshopDto } from 'src/common/dtos/update-worskshop.sto';
import { Roles } from '../utils/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AssignMultipleSpeakersToEventDTO } from './dto/assign-speaker-dto';
import { Public } from '../utils/decorators/public.decorator';

@Controller('workshops')
@ApiBearerAuth('JWT-auth')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  // Create a new workshop
  @Post()
  async create(@Body() createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    return this.workshopService.create(createWorkshopDto);
  }

  // Update an existing workshop
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ): Promise<Workshop> {
    const updated = await this.workshopService.update(id, updateWorkshopDto);
    return updated;
  }

  // Get all workshops
  @Get()
  @Public()
  async findAll(): Promise<Workshop[]> {
    return this.workshopService.findAll();
  }

  // Get a workshop by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Workshop> {
    return this.workshopService.findOne(id);
  }

  // Delete a workshop
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.workshopService.remove(id);
  }
 @Put(':workshopId/speakers')
  @Roles('ADMIN', 'COORDINATOR','EVENT_ORGANIZER')
  async assignMultipleWorkshops(
    @Param('workshopId') workshopId: string,
    @Body() body: AssignMultipleSpeakersToEventDTO
  ) {
    return await this.workshopService.assignSpeakersToWorkshop(workshopId, body.speakerIds);
  }

  @Put(':id/assign-organizer/:organizerId')
  @Roles('ADMIN','COORDINATOR')
  async assignOrganizer(
    @Param('id') workshopId: string,
    @Param('organizerId') organizerId: string,
  ) {
    return await this.workshopService.assignOrganizer(workshopId, organizerId);
  }

  @Get('organizer/:organizerId')
  async findByOrganizer(@Param('organizerId') organizerId: string) {
    return await this.workshopService.findByOrganizer(organizerId);
  }
}

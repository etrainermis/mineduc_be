// src/modules/event/event.controller.ts
import { Controller, Post, Put, Body, Param, Get, Delete, NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from 'src/common/dtos/create-event.dto';
import { UpdateEventDto } from 'src/common/dtos/update-event.dto';
import { Event } from 'src/entities/event.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../utils/decorators/public.decorator';
import { Roles } from '../utils/decorators/roles.decorator';
import { AssignMultipleWorkshopsToEventDTO } from './dto/assign-workshop-dto';

@Controller('events')
@ApiTags('events')
@ApiBearerAuth('JWT-auth')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Create a new event
  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventService.create(createEventDto);
  }

  // Update an existing event
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    return this.eventService.update(id, updateEventDto);
  }

  // Assign workshops to an event
  @Put(':eventId/workshops')
  @ApiResponse({ status: 200, description: 'Workshops assigned successfully' })
  @ApiResponse({ status: 404, description: 'Event or Workshops not found' })
  async assignWorkshops(
    @Param('eventId') eventId: string,
    @Body('workshopIds') workshopIds: string[], // Expecting an array of workshop IDs
  ): Promise<Event> {
    // Ensure that workshops are available for the event before assigning
    for (const workshopId of workshopIds) {
      const isAvailable = await this.eventService.isWorkshopAvailableForEvent(eventId, workshopId);
      if (isAvailable) {
        throw new NotFoundException(`Workshop with ID ${workshopId} is already assigned to the event`);
      }
    }
    return this.eventService.assignMultipleWorkshops(eventId, workshopIds);
  }

  // Get all events
  @Get('/all-events')
  @Public()
  async findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  // Get a single event by ID
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  // Delete an event
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.eventService.remove(id);
  }
  @Put(':eventId/workshops/:workshopId')
  @Roles('ADMIN', 'COORDINATOR')
  async assignWorkshop(
    @Param('eventId') eventId: string,
    @Param('workshopId') workshopId: string,
  ) {
    return await this.eventService.assignWorkshop(eventId, workshopId);
  }

  @Put(':eventId/workshops')
  @Roles('ADMIN', 'COORDINATOR')
  async assignMultipleWorkshops(
    @Param('eventId') eventId: string,
    @Body() body: AssignMultipleWorkshopsToEventDTO
  ) {
    return await this.eventService.assignMultipleWorkshops(eventId, body.workshopIds);
  }

  @Delete(':eventId/workshops/:workshopId')
  @Roles('ADMIN', 'COORDINATOR')
  async removeWorkshop(
    @Param('eventId') eventId: string,
    @Param('workshopId') workshopId: string,
  ) {
    return await this.eventService.removeWorkshop(eventId, workshopId);
  }

  @Delete(':eventId/workshops')
  @Roles('ADMIN', 'COORDINATOR')
  async removeMultipleWorkshops(
    @Param('eventId') eventId: string,
    @Body() body: AssignMultipleWorkshopsToEventDTO
  ) {
    return await this.eventService.removeMultipleWorkshops(eventId, body.workshopIds);
  }

  @Get(':id/workshops')
  async getEventWorkshops(@Param('id') id: string) {
    return await this.eventService.getEventWorkshops(id);
  }


  @Put(':id/toggle-publish')
  @Roles('ADMIN', 'COORDINATOR')
  async togglePublishStatus(@Param('id') id: string) {
    return await this.eventService.togglePublishStatus(id);
  }
}

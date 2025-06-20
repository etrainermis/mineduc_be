import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';
import { CreateEventDto } from 'src/common/dtos/create-event.dto';
import { UpdateEventDto } from 'src/common/dtos/update-event.dto';
import { Workshop } from 'src/entities/workshop.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
  ) {}

  // Create a new event
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create(createEventDto);
    return this.eventRepo.save(event);
  }

  // Update an existing event
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    const updatedEvent = this.eventRepo.merge(event, updateEventDto);
    return this.eventRepo.save(updatedEvent);
  }
  async assignWorkshop(eventId: string, workshopId: string): Promise<Event> {
    const event = await this.findOne(eventId);
    const workshop = await this.workshopRepo.findOne({
      where: { id: workshopId },
      relations: ['event'],
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${workshopId} not found`);
    }

    // Check if workshop is already assigned to another event
    if (workshop.event && workshop.event.id !== eventId) {
      throw new BadRequestException('Workshop is already assigned to another event');
    }

    workshop.event = event;
    await this.workshopRepo.save(workshop);

    return this.findOne(eventId);
  }
  // Assign workshops to an event
  async assignMultipleWorkshops(eventId: string, workshopIds: string[]): Promise<Event> {
    const event = await this.findOne(eventId);
    const workshops = await this.workshopRepo.find({
      where: workshopIds.map(id => ({ id })),
    });

    if (workshops.length !== workshopIds.length) {
      throw new NotFoundException('One or more workshops not found');
    }

    // Check if any workshop is already assigned to a different event
    const invalidAssignments = workshops.filter(
      workshop => workshop.event && workshop.event.id !== eventId
    );

    if (invalidAssignments.length > 0) {
      const ids = invalidAssignments.map(w => w.id).join(', ');
      throw new Error(`Workshops with IDs: ${ids} are already assigned to other events`);
    }

    // Assign all workshops to the event
    for (const workshop of workshops) {
      workshop.event = event;
    }

    await this.workshopRepo.save(workshops);
    return this.findOne(eventId);
  }

  // Get all events
async findAll(): Promise<Event[]> {
  return this.eventRepo.find({
    relations: ['workshops'], // include workshops if you want them in the response
  });
}


  async removeWorkshop(eventId: string, workshopId: string): Promise<Event> {
    const event = await this.findOne(eventId);
    const workshop = await this.workshopRepo.findOne({
      where: { id: workshopId },
      relations: ['event'],
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${workshopId} not found`);
    }

    if (workshop.event?.id !== eventId) {
      throw new Error('Workshop is not assigned to this event');
    }

    workshop.event = null;
    await this.workshopRepo.save(workshop);

    return this.findOne(eventId);
  }

  async removeMultipleWorkshops(eventId: string, workshopIds: string[]): Promise<Event> {
    const event = await this.findOne(eventId);
    const workshops = await this.workshopRepo.find({
      where: workshopIds.map(id => ({ id })),
      relations: ['event'],
    });

    if (workshops.length !== workshopIds.length) {
      throw new NotFoundException('One or more workshops not found');
    }

    // Check if all workshops are assigned to this event
    const invalidRemovals = workshops.filter(
      workshop => workshop.event?.id !== eventId
    );

    if (invalidRemovals.length > 0) {
      const ids = invalidRemovals.map(w => w.id).join(', ');
      throw new Error(`Workshops with IDs: ${ids} are not assigned to this event`);
    }

    // Remove all workshops from the event
    for (const workshop of workshops) {
      workshop.event = null;
    }

    await this.workshopRepo.save(workshops);
    return this.findOne(eventId);
  }

  async getEventWorkshops(eventId: string): Promise<Workshop[]> {
    const event = await this.findOne(eventId);
    return event.workshops;
  }

  async togglePublishStatus(eventId: string): Promise<Event> {
    const event = await this.findOne(eventId);
    event.isPublished = !event.isPublished;
    return await this.eventRepo.save(event);
  }

  // Check if workshop is available for the event
  async isWorkshopAvailableForEvent(eventId: string, workshopId: string): Promise<boolean> {
    const event = await this.eventRepo.findOne({ where: { id: eventId }, relations: ['workshops'] });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const workshop = event.workshops.find(workshop => workshop.id === workshopId);
    return workshop ? true : false; // Returns true if the workshop is already assigned to the event
  }

  // Find a single event by ID
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['workshops'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  // Delete an event
  async remove(id: string): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepo.remove(event);
  }
}

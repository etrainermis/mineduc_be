import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from 'src/entities/workshop.entity';
import { Event } from 'src/entities/event.entity';
import { CreateWorkshopDto } from 'src/common/dtos/create-workshops-dto';
import { UpdateWorkshopDto } from 'src/common/dtos/update-worskshop.sto';
import { EventOrganizer } from 'src/entities/event-organizer.entity';
import { User } from 'src/entities/user.entity';
import { Speaker } from 'src/entities/speaker.entity';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventOrganizer)
    private eventOrganizerRepository: Repository<EventOrganizer>,
    @InjectRepository(User)
    private userRepo : Repository<User>,
    @InjectRepository(Speaker)
    private speakerRepository : Repository<Speaker>

  ) {}

  // Create a new workshop
  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopRepo.create(createWorkshopDto);
    return this.workshopRepo.save(workshop);
  }

  // Update an existing workshop
  async update(id: string, updateWorkshopDto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    const updatedWorkshop = this.workshopRepo.merge(workshop, updateWorkshopDto);
    return this.workshopRepo.save(updatedWorkshop);
  }

  // Find all workshops
  async findAll(): Promise<Workshop[]> {
    return this.workshopRepo.find();
  }

  // Find a workshop by ID
  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopRepo.findOne({ where: { id } , relations : ['speakers']});
    if (!workshop) throw new NotFoundException('Workshop not found');
    return workshop;
  }

  // Delete a workshop
  async remove(id: string): Promise<void> {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    await this.workshopRepo.remove(workshop);
  }

    async assignSpeakersToWorkshop(workshopId: string, speakerIds: string[]): Promise<Workshop> {
    // Step 1: Find the event by its ID
    const workshop = await this.findOne(workshopId);

    // Step 2: Find the workshops by their IDs
    const speakers = await this.speakerRepository.findByIds(speakerIds);
    if (speakers.length !== speakerIds.length) {
      throw new NotFoundException('One or more workshops not found');
    }

    // Step 3: Add workshops to the event (making them available for this event)
    workshop.speakers = [...workshop.speakers, ...speakers];

    // Step 4: Save and return the updated event
    return this.workshopRepo.save(workshop);
  }

  async assignOrganizer(workshopId: string, organizerId: string): Promise<Workshop> {
    const workshop = await this.findOne(workshopId);
    const organizer = await this.userRepo.findOne({
      where: { id: organizerId },
    });

    if (!organizer) {
      throw new NotFoundException(`Event Organizer with ID ${organizerId} not found`);
    }

    workshop.organizer = organizer as EventOrganizer;
    return await this.workshopRepo.save(workshop);
  }

  async findByOrganizer(organizerId: string): Promise<Workshop[]> {
    return await this.workshopRepo
      .createQueryBuilder('workshop')
      .leftJoinAndSelect('workshop.organizer', 'organizer')
      .leftJoinAndSelect('workshop.event', 'event')
      .leftJoinAndSelect('workshop.speakers', 'speakers')
      .where('organizer.id = :organizerId', { organizerId })
      .getMany();
  }
}

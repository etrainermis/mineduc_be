import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDelegateDto } from '../../common/dtos/create-delegate.dto';
import { UsersService } from 'src/modules/users/users.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Delegate } from 'src/entities/delegate.entity';
import { MailingService } from 'src/integrations/mailing/mailing.service';
import * as QRCode from 'qrcode';
import { Workshop } from 'src/entities/workshop.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EGender } from 'src/common/enums/EGender.enum';

@Injectable()
export class DelegateService {
  constructor(
    @InjectRepository(Delegate) public delegateRepository: Repository<Delegate>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private mailingService: MailingService,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private cloudinary: CloudinaryService,
  ) { }
  private delegates: any[] = []; // For demo purposes. Replace with DB integration.

async create(
  createDelegateDto: CreateDelegateDto,
  file?: Express.Multer.File,
): Promise<Delegate> {
  let workshopIds = createDelegateDto.workshopIds as string | string[];

  // Validate workshop selection
  if (!workshopIds || (Array.isArray(workshopIds) && workshopIds.length !== 1)) {
    throw new BadRequestException('Please select exactly one workshop.');
  }

  // Handle comma-separated string input
  if (typeof workshopIds === 'string') {
    workshopIds = workshopIds.split(',').map((id) => id.trim());
    if (workshopIds.length !== 1) {
      throw new BadRequestException('Please select exactly one workshop.');
    }
  }

  // Validate gender
  let gender: EGender;
  switch (createDelegateDto.myGender.toLowerCase()) {
    case 'male':
      gender = EGender.MALE;
      break;
    case 'female':
      gender = EGender.FEMALE;
      break;
    case 'other':
      gender = EGender.OTHER;
      break;
    default:
      throw new BadRequestException(
        'The provided gender is invalid, should be male, female, or other',
      );
  }

  // Find the selected workshop
  const workshop = await this.workshopRepository.findOne({
    where: { id: workshopIds[0] },
  });

  if (!workshop) {
    throw new NotFoundException('Workshop not found');
  }

  // Increment registration count
  workshop.registered = (workshop.registered || 0) + 1;
  await this.workshopRepository.save(workshop);

  // Create the delegate
  const delegate = this.delegateRepository.create({
    ...createDelegateDto,
    gender: gender,
    is_approved: true,
    workshop, // Single workshop instead of array
  });

  // Handle profile picture upload
    if (file) {
      const pictureUrl = await this.cloudinary.uploadImage(file).catch((error) => {
        console.log(error);
        throw new BadRequestException('Invalid file type.');
      });
      delegate.profile_picture_url = pictureUrl.url;
    }

  const savedDelegate = await this.delegateRepository.save(delegate);

  // Optionally send welcome email
  // await this.mailingService.sendWelcomeEmail(savedDelegate);

  return savedDelegate;
}


  async generateDelegateQRCode(delegate: Delegate): Promise<string> {
    const data = {
      id: delegate.id,
      name: `${delegate.firstName} ${delegate.lastName}`,
      email: delegate.email,
      delegate_type: delegate.delegate_type,
    };

    const qr = await QRCode.toDataURL(JSON.stringify(data));
    return qr; // base64 image string
  }

  async getDelegatesByWorkshops(workshopIds: string[]): Promise<Delegate[]> {
    if (!workshopIds || workshopIds.length === 0) {
      throw new Error('No workshop IDs provided');
    }

    return await this.delegateRepository
      .createQueryBuilder('delegate')
      .leftJoinAndSelect('delegate.workshops', 'workshop')
      .where('workshop.id IN (:...workshopIds)', { workshopIds })
      .getMany();
  }

  async getDelegatesBySelectedActivities(
    activities: string[],
  ): Promise<Delegate[]> {
    return this.delegateRepository
      .createQueryBuilder('delegate')
      .where('delegate.selected_activities && ARRAY[:...activities]', {
        activities,
      })
      .getMany();
  }

  async getDelegatesBySelectedRoundTables(
    roundTables: string[],
  ): Promise<Delegate[]> {
    return this.delegateRepository
      .createQueryBuilder('delegate')
      .where('delegate.selected_round_tables && ARRAY[:...roundTables]', {
        roundTables,
      })
      .getMany();
  }

  async findAll(): Promise<Delegate[]> {
    return await this.delegateRepository.find({
      relations: ['workshops'], // include if needed
    });
  }

  async findOne(id: string) {
    const delegate = await this.delegateRepository.findOne({ where: { id }, relations: ['workshops'] });
    if (!delegate) {
      throw new NotFoundException('Delegate not found');
    }
    return delegate;
  }
  async remove(id: string): Promise<any> {
    const delegate = await this.delegateRepository.findOne({
      where: { id }
    });
  
    if (!delegate) {
      throw new NotFoundException('Delegate not found');
    }
  
    await this.delegateRepository.remove(delegate);
  
    return {'message': 'Delegate deleted successfully!'};
  }
  
  


}

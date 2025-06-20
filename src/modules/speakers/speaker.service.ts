import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speaker } from '../../entities/speaker.entity';
import { CreateSpeakerDto } from 'src/common/dtos/create-speaker-dto';
import { UpdateSpeakerDto } from 'src/common/dtos/update-speaker-dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SpeakerService {
  constructor(
    @InjectRepository(Speaker)
    private speakerRepo: Repository<Speaker>,
    private cloudinary: CloudinaryService,
  ) {}

  async create(
    body: CreateSpeakerDto,
    file?: Express.Multer.File,
  ): Promise<Speaker> {
    const speaker = this.speakerRepo.create({
      ...body,
    });
    if (file) {
      
      const pictureUrl = await this.cloudinary.uploadImage(file).catch((error) => {
        console.log(error);
        
        throw new BadRequestException(error);
      });
      speaker.profile_picture_url = pictureUrl.url;
    }
    return this.speakerRepo.save(speaker);
  }

  async approve(id: string): Promise<Speaker> {
    const speaker = await this.speakerRepo.findOneBy({ id });
    if (!speaker) throw new NotFoundException('Speaker not found');
    speaker.status = 'CONFIRMED';
    return this.speakerRepo.save(speaker);
  }

  async getConfirmedSpeakers(): Promise<Speaker[]> {
    return this.speakerRepo.find({
      where: { status: 'CONFIRMED' },
    });
  }

  async findAll(): Promise<Speaker[]> {
    return this.speakerRepo.find();
  }

  async findOne(id: string): Promise<Speaker> {
    const speaker = await this.speakerRepo.findOneBy({ id });
    if (!speaker) throw new NotFoundException('Speaker not found');
    return speaker;
  }

  async update(id: string, body: Partial<UpdateSpeakerDto>): Promise<Speaker> {
    const speaker = await this.speakerRepo.findOneBy({ id });
    if (!speaker) throw new NotFoundException('Speaker not found');

    const updated = this.speakerRepo.merge(speaker, body);
    return this.speakerRepo.save(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const speaker = await this.speakerRepo.findOneBy({ id });
    if (!speaker) throw new NotFoundException('Speaker not found');

    await this.speakerRepo.remove(speaker);
    return { message: 'Speaker deleted successfully' };
  }

  async togglePublish(speakerId: string): Promise<Speaker> {
    const speaker = await this.speakerRepo.findOne({
      where: { id: speakerId },
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    if (speaker.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed speakers can be published');
    }

    speaker.published = !speaker.published;

    return await this.speakerRepo.save(speaker);
  }
}

import { Controller, Post, Body, Param, Get, Patch, Delete, Put,  UseInterceptors,
  UploadedFile, } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { Speaker } from '../../entities/speaker.entity';
import { CreateSpeakerDto } from 'src/common/dtos/create-speaker-dto';
import { Public } from '../utils/decorators/public.decorator';
import { UpdateSpeakerDto } from 'src/common/dtos/update-speaker-dto';
import { editFileName, imageFileFilter } from '../utils/multer.config'; // adjust path accordingly
import {
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('speakers')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('profile_picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSpeakerDto })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSpeakerDto: CreateSpeakerDto,
  ) {
    const created = await this.speakerService.create(createSpeakerDto, file);

    return {
      ...created,
      profile_picture: created.profile_picture_url};
  }
  @Patch(':id/approve')
  @Public()
  async approve(@Param('id') id: string): Promise<Speaker> {
    return this.speakerService.approve(id);
  }

  @Get('confirmed')
  @Public()
  async getConfirmed(): Promise<Speaker[]> {
    return this.speakerService.getConfirmedSpeakers();
  }

  @Get('getAllSpeakers')
  @Public()
  async findAll(): Promise<Speaker[]> {
    return this.speakerService.findAll();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<Speaker> {
    return this.speakerService.findOne(id);
  }

  @Patch(':id')
  @Public()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSpeakerDto,
  ): Promise<Speaker> {
    return this.speakerService.update(id, body);
  }

  @Delete(':id')
  @Public()
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.speakerService.remove(id);
  }

  @Put(':id/toggle-publish')
  @Public()
  async togglePublish(@Param('id') id: string) {
    return await this.speakerService.togglePublish(id);
  }
}

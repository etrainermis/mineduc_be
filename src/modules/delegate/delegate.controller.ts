import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DelegateService } from './delegate.service';
import { CreateDelegateDto } from '../../common/dtos/create-delegate.dto';
import { editFileName, imageFileFilter } from '../utils/multer.config'; // adjust path accordingly

import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../utils/decorators/public.decorator';
import { diskStorage } from 'multer';
import { Delegate } from 'src/entities/delegate.entity';

@ApiTags('Delegates')
@Controller('delegates')
@ApiBearerAuth('JWT-auth')
export class DelegateController {
  constructor(private readonly delegateService: DelegateService) {}

  @Public()
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_picture_url'))
  @ApiBody({ type: CreateDelegateDto })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDelegateDto: CreateDelegateDto,
  ) {
    const created = await this.delegateService.create(createDelegateDto, file);

    return {
      ...created,
      profile_picture_url: created.profile_picture_url,
    };
  }

  @Public()
  @Get()
  findAll() {
    return this.delegateService.findAll();
  }

  @Public()
  @Get('by-workshops')
  async getByWorkshops(@Query('ids') ids: string) {
    const workshopIds = ids.split(',');
    return await this.delegateService.getDelegatesByWorkshops(workshopIds);
  }

  @Public()
  @Get('by-activities')
  async getByActivities(
    @Query('activities') activities: string | string[],
  ): Promise<Delegate[]> {
    const normalizedActivities = Array.isArray(activities)
      ? activities
      : [activities];
    return this.delegateService.getDelegatesBySelectedActivities(
      normalizedActivities,
    );
  }

  @Public()
  @Get('by-round-tables')
  async getByRoundTables(
    @Query('roundTables') roundTables: string | string[],
  ): Promise<Delegate[]> {
    const normalizedRoundTables = Array.isArray(roundTables)
      ? roundTables
      : [roundTables];
    return this.delegateService.getDelegatesBySelectedRoundTables(
      normalizedRoundTables,
    );
  }

  @Public()
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.delegateService.findOne(id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    console.log('ID from request:', id);
    return this.delegateService.remove(id);
  }

  @Public()
  @Post('verify-qr')
  @HttpCode(HttpStatus.OK)
  async verifyQR(@Body() body: { qrData: string }) {
    try {
      const data = JSON.parse(body.qrData);

      const delegate = await this.delegateService.findOne(data.id);

      if (delegate && delegate.is_approved) {
        return {
          status: 'approved',
          name: `${delegate.firstName} ${delegate.lastName}`,
          delegate_type: delegate.delegate_type,
        };
      } else {
        return { status: 'not_approved' };
      }
    } catch (err) {
      throw new BadRequestException('Invalid QR data');
    }
  }
}

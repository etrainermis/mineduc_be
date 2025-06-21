import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateDelegateDto } from '../../common/dtos/create-delegate.dto';
import { DelegateService } from './delegate.service';
import { DelegateController } from './delegate.controller';
import { User } from '../../entities/user.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Delegate } from 'src/entities/delegate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delegate, User, Workshop]), CloudinaryModule],
  controllers: [DelegateController],
  providers: [DelegateService],
  exports: [DelegateService],
})
export class DelegateModule {}
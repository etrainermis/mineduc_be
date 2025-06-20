import { IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateSpeakerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  position: string

  @ApiProperty({ example: 'Expert in AI and ML' })
  @IsString()
  shortDescription: string

  @ApiProperty({ example: 'John has worked in the field of AI for over a decade...' })
  @IsString()
  biography: string

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',  // This is what makes Swagger show file upload
    description: 'Profile picture (JPG, PNG)',
    required: false,
  })
  profile_picture?: any

  @ApiProperty({ enum: ['CONFIRMED', 'PENDING'], default: 'PENDING', required: false })
  @IsOptional()
  @IsEnum(['CONFIRMED', 'PENDING'])
  status?: 'CONFIRMED' | 'PENDING'
}

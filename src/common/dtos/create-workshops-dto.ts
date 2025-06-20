import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { EWorkshopTime } from "../enums/EWorkshopTime.enum"

export class CreateWorkshopDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  short_description: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  venue: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  schedule: Date

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  capacity: number

}

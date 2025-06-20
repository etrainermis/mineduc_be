import { ApiProperty } from "@nestjs/swagger";

export class AssignMultipleWorkshopsToEventDTO{
    @ApiProperty()
    workshopIds : string[]
}
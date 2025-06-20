import { ApiProperty } from "@nestjs/swagger";

export class AssignMultipleSpeakersToEventDTO{
    @ApiProperty()
    speakerIds : string[]
}
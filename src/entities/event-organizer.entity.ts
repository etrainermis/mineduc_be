import { ChildEntity, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Workshop } from "./workshop.entity";

@ChildEntity('event_organizer') // This sets the "type" column value
export class EventOrganizer extends User {

  @OneToMany(() => Workshop, (workshop) => workshop.organizer)
  workshops: Workshop[];
}

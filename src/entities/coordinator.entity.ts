import { ChildEntity, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Event } from "./event.entity";

@ChildEntity('coordinator') // This sets the "type" column value
export class Coordinator extends User {
  @OneToMany(() => Event, (event) => event.coordinator)
  events: Event[];
 
}

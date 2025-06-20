import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Coordinator } from "./coordinator.entity"
import { Workshop } from "./workshop.entity"
import { Speaker } from "./speaker.entity"

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  venue: string

  @Column({ nullable: true })
  theme: string;


  @Column({ type: "timestamp" })
  schedule: Date

  @Column({ default: false })
  isPublished: boolean

  @ManyToOne(
    () => Coordinator,
    (coordinator) => coordinator.events
  )
  @JoinColumn({ name: "coordinatorId" })
  coordinator: Coordinator

  @OneToMany(
    () => Workshop,
    (workshop) => workshop.event
  )
  workshops: Workshop[]

  @ManyToMany(() => Speaker)
  @JoinTable({
    name: 'event_speakers',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'speakerId', referencedColumnName: 'id' }
  })
  speakers: Speaker[]
}
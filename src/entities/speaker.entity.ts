import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Workshop } from "./workshop.entity"

@Entity("speakers")
export class Speaker {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  position: string

  @Column()
  shortDescription: string

  @Column({ type: "text" })
  biography: string
  
  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({
    type: "enum",
    enum: ["CONFIRMED", "PENDING"],
    default: "PENDING"
  })
  status: string

  @ManyToMany(() => Workshop)
  @JoinTable({
    name: 'workshop_speakers',
    joinColumn: { name: 'speakerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'workshopId', referencedColumnName: 'id' }
  })
  workshops: Workshop[]

@Column({ default: false })
published: boolean;
}
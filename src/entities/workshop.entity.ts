import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Event } from './event.entity';
import { EventOrganizer } from './event-organizer.entity';
import { Speaker } from './speaker.entity';
import { Delegate } from './delegate.entity';
import { EWorkshopTime } from 'src/common/enums/EWorkshopTime.enum';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  venue: string;

  @Column({ nullable: true })
  short_description: string;

  @Column({ type: 'timestamp' })
  schedule: Date;

  @Column()
  capacity: number;

  @Column({ default: 0 })
  registered: number;

  @ManyToOne(() => Event, (event) => event.workshops)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => EventOrganizer, (eventOrganizer) => eventOrganizer.workshops)
  @JoinColumn({ name: 'organizerId' })
  organizer: EventOrganizer;

  @ManyToMany(() => Speaker)
  @JoinTable({
    name: 'workshop_speakers',
    joinColumn: { name: 'workshopId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'speakerId', referencedColumnName: 'id' },
  })
  speakers: Speaker[];

  // ✅ Updated relation to reflect single workshop per delegate
  @OneToMany(() => Delegate, (delegate) => delegate.workshop)
  delegates: Delegate[];
}

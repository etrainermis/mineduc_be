import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { EDelegateType } from '../common/enums/EDelegateType.enum';
import { EEventType } from 'src/common/enums/EEventType.enum';
import { Workshop } from './workshop.entity';

@ChildEntity('delegate') // This marks it as an extension of User
export class Delegate extends User {
  @Column({
    type: 'enum',
    enum: EDelegateType,
    default: EDelegateType.EXP,
  })
  delegate_type: EDelegateType;

  @Column()
  country: string;

  @Column()
  partner_state: string;

  @Column()
  organization: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({ nullable: true })
  dietary_restrictions: string;

  @Column({ nullable: true })
  special_needs: string;

  @Column({ type: 'timestamp', nullable: true })
  arrival_datetime: Date;

  @Column({ type: 'timestamp', nullable: true })
  departure_datetime: Date;

  @Column({ nullable: true })
  airline: string;
  @Column({ nullable: true })
  accommodation_status: string;

  @Column({ nullable: true })
  accommodation_details: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Column({ default: false })
  is_approved: boolean;

  @Column({
    type: 'enum',
    enum: EEventType,
    nullable: true,
  })
  selected_event?: EEventType;

  @Column('simple-array', { nullable: true })
  selected_activities?: string[];

  @Column('simple-array', { nullable: true })
  selected_round_tables?: string[];

  @ManyToOne(() => Workshop, { cascade: true })
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;
}

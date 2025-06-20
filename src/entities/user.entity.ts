/* eslint-disable */
/*
 @auhor : © 2025 Alice Umugwaneza <umugwanezaalice22@gmail.com>
*/

/**
 * @file
 * @brief User entity
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  TableInheritance,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { EGender } from '../common/enums/EGender.enum';
import { EAccountStatus } from '../common/enums/EAccountStatus.enum';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Role } from './role.entity';


@Entity('users')
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class User extends InitiatorAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: String;

  @Column()
  lastName: String;

  @Column()
  email: String;

  @Column()
  username: String;

  @Column()
  phonenumber: String;


  @Column({
    nullable: true,
    default: null,
  })
  last_login: Date;

  @Column({
    type: String,
    enum: EGender,
    default: EGender[EGender.MALE],
  })
  gender: EGender;
  @JoinColumn({
    name: 'profile_picture',
  })
  profile_pic: string;

  @Column({nullable:true})
  password: String;

  @Column({
    nullable: true,
  })
  activationCode: number;


  @Column()
  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })  roles: Role[];

  @Column({nullable:true})
  national_id: String;

  @Column({nullable:true})
  verificationCodeExpiryDate: Date;

  constructor(
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    myGender: EGender,
    national_id: String,
    phonenumber: String,
    password: String,
    status: EAccountStatus,
    activationCode?: number,  // Optional
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.username = username;
    this.gender = myGender;
    this.national_id = national_id;
    this.phonenumber = phonenumber;
    this.password = password;
    this.status = EAccountStatus[status];
  
    // Use the constructor value or rely on the database default
    this.activationCode = activationCode || null;
  }
}  

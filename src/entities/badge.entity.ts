import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("badges")
export class Badge {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: false })
  isGenerated: boolean

  @Column({ type: "timestamp", nullable: true })
  generatedAt: Date
}
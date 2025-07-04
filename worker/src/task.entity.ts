import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column()
  priority: 'high' | 'medium' | 'low';

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ nullable: true, name: "started_at" })
  startedAt: Date;

  @Column({ nullable: true, name: "completed_at" })
  completedAt: Date;
}
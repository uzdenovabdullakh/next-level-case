import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  description: string;

  @Column({ default: 'pending' })
  @ApiProperty()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column()
  @ApiProperty()
  priority: 'high' | 'medium' | 'low';

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column({ nullable: true })
  @ApiProperty()
  startedAt: Date;

  @Column({ nullable: true })
  @ApiProperty()
  completedAt: Date;
}
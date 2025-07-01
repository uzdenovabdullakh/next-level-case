import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../models/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto) {
    const task = this.repo.create({ ...dto, status: 'pending' });
    const saved = await this.repo.save(task);

    return saved;
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async findAll(page: number, limit: number) {
    const [tasks, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tasks, total, page, limit };
  }
}
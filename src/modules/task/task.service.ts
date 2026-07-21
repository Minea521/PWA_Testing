/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
    });
    const saved = await this.taskRepository.save(task);
    return Array.isArray(saved) ? (saved[0] as Task) : (saved as Task);
  }

  async findAll(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findByUser(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number, sub: any): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: number, updateData: Partial<Task>, sub: any): Promise<Task> {
    const result = await this.taskRepository.update(id, updateData);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.findOne(id, sub);
  }

  async remove(id: number, sub: any): Promise<void> {
    const task = await this.findOne(id, sub);
    await this.taskRepository.remove(task);
  }
}

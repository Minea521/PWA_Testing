import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity'; // adjust path
import { User } from '../user/user.entity'; // if needed for assignment

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // CREATE a new task (you'll usually pass userId from controller/auth)
  async create(taskData: Partial<Task>, user: User): Promise<Task> {
    const newTask = this.taskRepository.create({
      ...taskData,
      user, // assign the owner (relation)
    });

    return this.taskRepository.save(newTask);
  }

  // READ all tasks (optionally filter by user)
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['user'], // load the owner user if needed
    });
  }

  // READ tasks for a specific user
  async findByUser(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // READ one task by id
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // UPDATE task
  async update(id: number, updateData: Partial<Task>): Promise<Task> {
    const task = await this.findOne(id);

    Object.assign(task, updateData);

    return this.taskRepository.save(task);
  }

  // DELETE task
  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}

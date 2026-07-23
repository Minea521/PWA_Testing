/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(@Req() req): Promise<Task[]> {
    return this.taskService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req): Promise<Task> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.taskService.findOne(numericId, req.user.sub);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req): Promise<Task> {
    return this.taskService.create(createTaskDto, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ): Promise<Task> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    const updatePayload: Partial<Task> = {
      ...updateTaskDto,
      completedAt: updateTaskDto.completedAt
        ? new Date(updateTaskDto.completedAt)
        : undefined,
      scheduledAt: updateTaskDto.scheduledAt
        ? new Date(updateTaskDto.scheduledAt)
        : undefined,
    };
    return this.taskService.update(numericId, updatePayload, req.user.sub);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req): Promise<{ message: string }> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    await this.taskService.remove(numericId, req.user.sub);
    return { message: 'Task deleted' };
  }
}
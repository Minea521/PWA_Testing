import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  // Show all tasks
  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  // Show tasks of one user
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.taskService.findByUser(Number(userId));
  }

  // Show one task
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(Number(id));
  }

  // Create new task
  // You send everything in the body (title, description, user: {id: ...})
  @Post()
  create(@Body() body: any) {
    // We extract the task data and the user object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user, ...taskData } = body;
    return this.taskService.create(taskData, user);
  }

  // Update task
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.taskService.update(Number(id), body);
  }

  // Delete task
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.taskService.remove(Number(id));
    return { message: 'Task deleted' };
  }
}

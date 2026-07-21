import { Module } from '@nestjs/common';
import { TasksController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Task } from './task.entity';
import { AuthModule } from '../../auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([Task]), UserModule, AuthModule],
  controllers: [TasksController],
  providers: [TaskService],
  exports: [TypeOrmModule, AuthModule], // Export TypeOrmModule and AuthModule for use in other modules
  // Add any other necessary configurations or modules
})
export class TaskModule {}

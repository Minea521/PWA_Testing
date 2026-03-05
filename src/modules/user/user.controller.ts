import {
  Get,
  Param,
  Controller,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // Show all users
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Show one user by id (example: /users/1)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  // Create new user
  @Post()
  create(@Body() body: createUserDto) {
    this.userService.create(body);
    return { message: 'User created' };
  }

  // Update user (example: /users/1)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    this.userService.update(Number(id), body);
    return { message: 'User updated' };
  }

  // Delete user (example: /users/1)
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.userService.remove(Number(id));
    return { message: 'User deleted' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // adjust path if needed

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // CREATE a new user
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData); // creates entity instance
    return this.userRepository.save(newUser); // saves to DB and returns with generated id
  }

  // READ all users + their tasks (with relations)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['tasks'], // loads related tasks for each user
    });
  }

  // READ one user by id + their tasks
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // UPDATE user (partial update - only send fields you want to change)
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id); // reuses findOne (throws if not found)

    // Merge new data into existing entity
    Object.assign(user, updateData);

    return this.userRepository.save(user);
  }

  // DELETE user by id
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id); // ensure exists

    await this.userRepository.remove(user); // or .delete(id) if you don't need cascades/soft-delete
  }
}

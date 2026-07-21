/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';   

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {}
    // Used when a new user registers
    async hashPassword(plainPassword: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(plainPassword, saltRounds);
    }

    // Used when a user logs in
    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
        throw new ConflictException('Email already in use');
        }

        // Use the helper instead of calling bcrypt directly
        const hashedPassword = await this.hashPassword(password);

        const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        });

        await this.userRepository.save(newUser);

        return { id: newUser.id, email: newUser.email };
    }

    async login(email: string, password: string) {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' }); // long-lived, revoked only on logout

      return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
    }
}
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repo/user.repository';
import { User } from '../model/user.modal';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async findOne(id: number): Promise<User> {
        return this.userRepository.findOne(id);
    }

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.findByEmail(email);
    }

    async create(data: Partial<User>): Promise<User> {
        return this.userRepository.create(data);
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        return this.userRepository.update(id, data);
    }

    async remove(id: number): Promise<void> {
        return this.userRepository.remove(id);
    }
} 
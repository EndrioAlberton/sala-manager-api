import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.modal';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<User> {
        return this.repository.findOne({ where: { id } });
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.repository.create(data);
        return this.repository.save(user);
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async searchByName(name: string): Promise<User[]> {
        if (!name) {
            return this.findAll();
        }
        return this.repository.find({
            where: {
                name: name
            }
        });
    }
}
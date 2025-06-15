import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDiscipline } from '../model/base-discipline.modal';

@Injectable()
export class BaseDisciplineRepository {
    constructor(
        @InjectRepository(BaseDiscipline)
        private repository: Repository<BaseDiscipline>
    ) {}

    async findAll(): Promise<BaseDiscipline[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<BaseDiscipline> {
        return this.repository.findOne({
            where: { id }
        });
    }

    async findByCode(code: string): Promise<BaseDiscipline> {
        return this.repository.findOne({
            where: { code }
        });
    }

    async create(data: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        const discipline = this.repository.create(data);
        return this.repository.save(discipline);
    }

    async update(id: number, data: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }
} 
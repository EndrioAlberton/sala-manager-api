import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseDiscipline } from '../model/base-discipline.modal';
import { BaseDisciplineRepository } from '../repo/base-discipline.repository';

@Injectable()
export class BaseDisciplineService {
    constructor(
        private readonly baseDisciplineRepository: BaseDisciplineRepository,
    ) {}

    async findAll(): Promise<BaseDiscipline[]> {
        return this.baseDisciplineRepository.findAll();
    }

    async findOne(id: number): Promise<BaseDiscipline> {
        const discipline = await this.baseDisciplineRepository.findOne(id);
        if (!discipline) {
            throw new NotFoundException(`Disciplina base com ID ${id} não encontrada`);
        }
        return discipline;
    }

    async findByCode(code: string): Promise<BaseDiscipline> {
        const discipline = await this.baseDisciplineRepository.findByCode(code);
        if (!discipline) {
            throw new NotFoundException(`Disciplina base com código ${code} não encontrada`);
        }
        return discipline;
    }

    async create(discipline: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        return this.baseDisciplineRepository.create(discipline);
    }

    async update(id: number, discipline: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        await this.findOne(id);
        return this.baseDisciplineRepository.update(id, discipline);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.baseDisciplineRepository.remove(id);
    }
} 
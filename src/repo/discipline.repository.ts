import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discipline } from '../model/discipline.modal';
import { UserType } from '../model/user.modal';

@Injectable()
export class DisciplineRepository {
    constructor(
        @InjectRepository(Discipline)
        private repository: Repository<Discipline>
    ) {}

    async findAll(): Promise<Discipline[]> {
        return this.repository.find({
            relations: ['professor', 'baseDiscipline']
        });
    }

    async findOne(id: number): Promise<Discipline> {
        return this.repository.findOne({
            where: { id },
            relations: ['professor', 'baseDiscipline']
        });
    }

    async create(data: Partial<Discipline>): Promise<Discipline> {
        const discipline = this.repository.create(data);
        const saved = await this.repository.save(discipline);
        return this.findOne(saved.id);
    }

    async update(id: number, data: Partial<Discipline>): Promise<Discipline> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findByProfessor(professorId: number): Promise<Discipline[]> {
        return this.repository
            .createQueryBuilder('discipline')
            .leftJoinAndSelect('discipline.professor', 'professor')
            .leftJoinAndSelect('discipline.baseDiscipline', 'baseDiscipline')
            .where('discipline.professorId = :professorId', { professorId })
            .andWhere('professor.userType = :userType', { userType: UserType.PROFESSOR })
            .getMany();
    }

    async findByProfessorAndBaseDiscipline(professorId: number, baseDisciplineId: number): Promise<Discipline | null> {
        return this.repository
            .createQueryBuilder('discipline')
            .leftJoinAndSelect('discipline.professor', 'professor')
            .leftJoinAndSelect('discipline.baseDiscipline', 'baseDiscipline')
            .where('discipline.professorId = :professorId', { professorId })
            .andWhere('discipline.baseDisciplineId = :baseDisciplineId', { baseDisciplineId })
            .getOne();
    }
} 
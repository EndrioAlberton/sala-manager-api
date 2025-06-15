import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Discipline } from '../model/discipline.modal';
import { DisciplineRepository } from '../repo/discipline.repository';
import { UserRepository } from '../repo/user.repository';
import { BaseDisciplineRepository } from '../repo/base-discipline.repository';
import { OccupationRepository } from '../repo/occupation.repository';
import { UserType } from '../model/user.modal';

@Injectable()
export class DisciplineService {
    constructor(
        private readonly disciplineRepository: DisciplineRepository,
        private readonly userRepository: UserRepository,
        private readonly baseDisciplineRepository: BaseDisciplineRepository,
        private readonly occupationRepository: OccupationRepository,
    ) {}

    async findAll(): Promise<Discipline[]> {
        return this.disciplineRepository.findAll();
    }

    async findOne(id: number): Promise<Discipline> {
        const discipline = await this.disciplineRepository.findOne(id);
        if (!discipline) {
            throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
        }
        return discipline;
    }

    async create(discipline: Partial<Discipline>, userId: number): Promise<Discipline> {
        const professor = await this.userRepository.findOne(discipline.professorId);
        if (!professor) {
            throw new NotFoundException(`Professor com ID ${discipline.professorId} não encontrado`);
        }
        if (professor.userType !== UserType.PROFESSOR) {
            throw new BadRequestException(`Usuário com ID ${discipline.professorId} não é um professor`);
        }

        // Verifica se o usuário é admin ou o próprio professor
        const user = await this.userRepository.findOne(userId);
        if (user.userType !== UserType.ADMIN && discipline.professorId !== userId) {
            throw new UnauthorizedException('Você só pode adicionar disciplinas para você mesmo');
        }

        // Verifica se a disciplina base existe
        const baseDiscipline = await this.baseDisciplineRepository.findOne(discipline.baseDisciplineId);
        if (!baseDiscipline) {
            throw new NotFoundException(`Disciplina base com ID ${discipline.baseDisciplineId} não encontrada`);
        }

        // Verifica se o professor já tem esta disciplina
        const existingDiscipline = await this.disciplineRepository.findByProfessorAndBaseDiscipline(
            discipline.professorId,
            discipline.baseDisciplineId
        );
        
        if (existingDiscipline) {
            throw new ConflictException(`Você já possui a disciplina ${baseDiscipline.name} (${baseDiscipline.code})`);
        }

        return this.disciplineRepository.create(discipline);
    }

    async update(id: number, discipline: Partial<Discipline>, userId: number): Promise<Discipline> {
        const existingDiscipline = await this.findOne(id);
        
        // Verifica se o usuário é admin ou o próprio professor
        const user = await this.userRepository.findOne(userId);
        if (user.userType !== UserType.ADMIN && existingDiscipline.professorId !== userId) {
            throw new UnauthorizedException('Você só pode atualizar suas próprias disciplinas');
        }
        
        if (discipline.professorId) {
            const professor = await this.userRepository.findOne(discipline.professorId);
            if (!professor) {
                throw new NotFoundException(`Professor com ID ${discipline.professorId} não encontrado`);
            }
            if (professor.userType !== UserType.PROFESSOR) {
                throw new BadRequestException(`Usuário com ID ${discipline.professorId} não é um professor`);
            }
        }

        if (discipline.baseDisciplineId) {
            const baseDiscipline = await this.baseDisciplineRepository.findOne(discipline.baseDisciplineId);
            if (!baseDiscipline) {
                throw new NotFoundException(`Disciplina base com ID ${discipline.baseDisciplineId} não encontrada`);
            }
        }

        return this.disciplineRepository.update(id, discipline);
    }

    async remove(id: number, userId: number): Promise<void> {
        const discipline = await this.findOne(id);
        
        // Verifica se o usuário é admin ou o próprio professor
        const user = await this.userRepository.findOne(userId);
        if (user.userType !== UserType.ADMIN && discipline.professorId !== userId) {
            throw new UnauthorizedException('Você só pode remover suas próprias disciplinas');
        }

        // Busca a disciplina base para ter o nome da disciplina
        const baseDiscipline = await this.baseDisciplineRepository.findOne(discipline.baseDisciplineId);
        if (!baseDiscipline) {
            throw new NotFoundException('Disciplina base não encontrada');
        }

        // Verifica se existem ocupações para esta disciplina
        const professor = await this.userRepository.findOne(discipline.professorId);
        const occupations = await this.occupationRepository.findByTeacherAndSubject(
            professor.email,
            baseDiscipline.name
        );

        if (occupations.length > 0) {
            throw new ConflictException(
                `Não é possível remover a disciplina "${baseDiscipline.name}" pois existem salas ocupadas com esta disciplina`
            );
        }
        
        await this.disciplineRepository.remove(id);
    }

    async findByProfessor(professorId: number): Promise<Discipline[]> {
        const disciplines = await this.disciplineRepository.findByProfessor(professorId);
        if (disciplines.length === 0) {
            throw new NotFoundException(`Nenhuma disciplina encontrada para o professor com ID ${professorId}`);
        }
        return disciplines;
    }
} 
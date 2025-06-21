import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ClassRoom } from '../model/classroom.modal';
import { ClassroomRepository } from '../repo/classroom.repository';
import { OccupationRepository } from '../repo/occupation.repository';

@Injectable()
export class ClassroomService {
    constructor(
        private readonly classroomRepository: ClassroomRepository,
        private readonly occupationRepository: OccupationRepository,
    ) {}

    // GET /classrooms
    async findAll(): Promise<ClassRoom[]> {
        return this.classroomRepository.findAll();
    }

    // GET /classrooms/:id
    async findOne(id: number): Promise<ClassRoom> {
        const classroom = await this.classroomRepository.findOne(id);
        if (!classroom) {
            throw new NotFoundException(`Sala com ID ${id} não encontrada`);
        }
        return classroom;
    }

    // POST /classrooms
    async create(classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        return this.classroomRepository.create(classroom);
    }

    // PUT /classrooms/:id
    async update(id: number, classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        await this.findOne(id);
        return this.classroomRepository.update(id, classroom);
    }

    // DELETE /classrooms/:id
    async remove(id: number): Promise<void> {
        const classroom = await this.findOne(id);
        
        // Verifica se existem ocupações para esta sala
        const occupations = await this.occupationRepository.findByRoomId(id);
        
        if (occupations.length > 0) {
            throw new ConflictException(
                `Não é possível remover a sala ${classroom.roomNumber} pois existem ocupações registradas para ela`
            );
        }

        await this.classroomRepository.remove(id);
    }

    // GET /classrooms/search
    async searchByRoomNumber(roomNumber: string): Promise<ClassRoom[]> {
        return this.classroomRepository.searchByRoomNumber(roomNumber);
    }

    // GET /classrooms/filter
    async searchByFilters(filters: {
        hasProjector?: boolean;
        minCapacity?: number;
        maxCapacity?: number;
    }): Promise<ClassRoom[]> {
        return this.classroomRepository.searchByFilters(filters);
    }
} 
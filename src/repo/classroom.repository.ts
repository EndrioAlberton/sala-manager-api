import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { ClassRoom } from '../model/classroom.modal';

@Injectable()
export class ClassroomRepository {
    constructor(
        @InjectRepository(ClassRoom)
        private repository: Repository<ClassRoom>,
    ) {}

    async findAll(): Promise<ClassRoom[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<ClassRoom> {
        return this.repository.findOne({ where: { id } });
    }

    async findAvailable(): Promise<ClassRoom[]> {
        return this.repository.find({ where: { isOccupied: false } });
    }

    async searchByRoomNumber(roomNumber: string): Promise<ClassRoom[]> {
        if (!roomNumber) {
            return this.findAll();
        }
        return this.repository.find({
            where: {
                roomNumber: Like(`%${roomNumber}%`)
            }
        });
    }

    async searchByFilters(filters: {
        hasProjector?: boolean;
        minCapacity?: number;
        maxCapacity?: number;
        isAvailable?: boolean;
    }): Promise<ClassRoom[]> {
        // Se não houver filtros, retorna todas as salas
        if (!filters.hasProjector && !filters.minCapacity && !filters.maxCapacity && !filters.isAvailable) {
            return this.findAll();
        }

        const where: any = {};

        // Aplica filtro de projetor apenas se foi especificado
        if (filters.hasProjector !== undefined) {
            where.hasProjector = filters.hasProjector;
        }

        // Aplica filtro de capacidade apenas se foi especificado
        if (filters.minCapacity !== undefined || filters.maxCapacity !== undefined) {
            where.maxStudents = Between(
                filters.minCapacity || 0,
                filters.maxCapacity || 999999
            );
        }

        // Aplica filtro de disponibilidade apenas se foi especificado
        if (filters.isAvailable !== undefined) {
            where.isOccupied = !filters.isAvailable;
        }

        console.log('Filtros aplicados:', where); // Adiciona log para debug
        return this.repository.find({ where });
    }

    async create(classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        const newClassroom = this.repository.create(classroom);
        return this.repository.save(newClassroom);
    }

    async update(id: number, data: Partial<ClassRoom>): Promise<ClassRoom> {
        // Primeiro busca a sala existente
        const existingRoom = await this.repository.findOne({ where: { id } });
        if (!existingRoom) {
            throw new Error('Sala não encontrada');
        }

        // Mescla os dados existentes com os novos dados
        const updatedRoom = this.repository.merge(existingRoom, data);

        // Salva as alterações
        return this.repository.save(updatedRoom);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async occupy(id: number, teacher: string, subject: string): Promise<ClassRoom> {
        await this.repository.update(id, {
            isOccupied: true,
            currentTeacher: teacher,
            currentSubject: subject
        });
        return this.findOne(id);
    }

    async vacate(id: number): Promise<ClassRoom> {
        await this.repository.update(id, {
            isOccupied: false,
            currentTeacher: null,
            currentSubject: null
        });
        return this.findOne(id);
    }
} 
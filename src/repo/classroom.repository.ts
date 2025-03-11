import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRoom } from '../model/classroom.modal';

@Injectable()
export class ClassroomRepository {
    constructor(
        @InjectRepository(ClassRoom)
        private repository: Repository<ClassRoom>
    ) {}

    async findAll(): Promise<ClassRoom[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<ClassRoom> {
        return this.repository.findOne({ where: { id } });
    }

    async create(data: Partial<ClassRoom>): Promise<ClassRoom> {
        const classroom = this.repository.create(data);
        return this.repository.save(classroom);
    }

    async update(id: number, data: Partial<ClassRoom>): Promise<ClassRoom> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async searchByRoomNumber(roomNumber: string): Promise<ClassRoom[]> {
        if (!roomNumber) {
            return this.findAll();
        }
        return this.repository.find({
            where: {
                roomNumber: roomNumber
            }
        });
    }

    async searchByFilters(filters: {
        hasProjector?: boolean;
        minCapacity?: number;
        maxCapacity?: number;
    }): Promise<ClassRoom[]> {
        const where: any = {};

        if (filters.hasProjector !== undefined) {
            where.hasProjector = filters.hasProjector;
        }

        if (filters.minCapacity !== undefined || filters.maxCapacity !== undefined) {
            where.maxStudents = {};
            if (filters.minCapacity !== undefined) {
                where.maxStudents = filters.minCapacity;
            }
            if (filters.maxCapacity !== undefined) {
                where.maxStudents = filters.maxCapacity;
            }
        }

        return this.repository.find({ where });
    }
} 
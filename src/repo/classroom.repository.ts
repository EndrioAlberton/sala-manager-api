import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
        return this.repository.find({
            where: {
                roomNumber: Like(`%${roomNumber}%`)
            }
        });
    }

    async create(classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        const newClassroom = this.repository.create(classroom);
        return this.repository.save(newClassroom);
    }

    async update(id: number, classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        await this.repository.update(id, classroom);
        return this.findOne(id);
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
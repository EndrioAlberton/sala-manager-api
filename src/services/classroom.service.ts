import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ClassRoom } from '../model/ClassRoom';

@Injectable()
export class ClassroomService {
    constructor(
        @InjectRepository(ClassRoom)
        private classroomRepository: Repository<ClassRoom>,
    ) {}

    // GET /classrooms
    async findAll(): Promise<ClassRoom[]> {
        return this.classroomRepository.find();
    }

    // GET /classrooms/:id
    async findOne(id: number): Promise<ClassRoom> {
        const classroom = await this.classroomRepository.findOne({ where: { id } });
        if (!classroom) {
            throw new NotFoundException(`Sala com ID ${id} não encontrada`);
        }
        return classroom;
    }

    // POST /classrooms
    async create(classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        const newClassroom = this.classroomRepository.create(classroom);
        return this.classroomRepository.save(newClassroom);
    }

    // PUT /classrooms/:id
    async update(id: number, classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        const existingClassroom = await this.findOne(id);
        Object.assign(existingClassroom, classroom);
        return this.classroomRepository.save(existingClassroom);
    }

    // DELETE /classrooms/:id
    async remove(id: number): Promise<void> {
        const result = await this.classroomRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Sala com ID ${id} não encontrada`);
        }
    }

    // GET /classrooms/available
    async findAvailable(): Promise<ClassRoom[]> {
        return this.classroomRepository.find({ where: { isOccupied: false } });
    }

    // PUT /classrooms/:id/occupy
    async occupy(id: number, teacher: string, subject: string): Promise<ClassRoom> {
        const classroom = await this.findOne(id);
        classroom.isOccupied = true;
        classroom.currentTeacher = teacher;
        classroom.currentSubject = subject;
        return this.classroomRepository.save(classroom);
    }

    // PUT /classrooms/:id/vacate
    async vacate(id: number): Promise<ClassRoom> {
        const classroom = await this.findOne(id);
        classroom.isOccupied = false;
        classroom.currentTeacher = null;
        classroom.currentSubject = null;
        return this.classroomRepository.save(classroom);
    }

    // GET /classrooms/search
    async searchByRoomNumber(roomNumber: string): Promise<ClassRoom[]> {
        return this.classroomRepository.find({
            where: {
                roomNumber: Like(`%${roomNumber}%`)
            }
        });
    }
} 
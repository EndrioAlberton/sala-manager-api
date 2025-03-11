import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { ClassRoom } from '../model/classroom.modal';

@Controller('classrooms')
export class ClassroomController {
    constructor(
        private readonly classroomService: ClassroomService
    ) {}

    @Post()
    async create(@Body() classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        if (!this.validateCreate(classroom)) {
            throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
        }
        return this.classroomService.create(classroom);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        if (!this.validateUpdate(classroom)) {
            throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
        }
        return this.classroomService.update(id, classroom);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.classroomService.remove(id);
    }

    @Get()
    async findAll(): Promise<ClassRoom[]> {
        return this.classroomService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<ClassRoom> {
        return this.classroomService.findOne(id);
    }

    private validateCreate(data: any): boolean {
        return (
            data.roomNumber && data.roomNumber.length <= 10 &&
            data.building && data.building.length <= 50 &&
            Number.isInteger(data.floor) && data.floor >= 0 && data.floor <= 20 &&
            Number.isInteger(data.desks) && data.desks >= 0 && data.desks <= 100 &&
            Number.isInteger(data.chairs) && data.chairs >= 0 && data.chairs <= 100 &&
            (data.computers === undefined || (Number.isInteger(data.computers) && data.computers >= 0 && data.computers <= 50)) &&
            typeof data.hasProjector === 'boolean' &&
            Number.isInteger(data.maxStudents) && data.maxStudents >= 1 && data.maxStudents <= 100
        );
    }

    private validateUpdate(data: any): boolean {
        return (
            (!data.roomNumber || data.roomNumber.length <= 10) &&
            (!data.building || data.building.length <= 50) &&
            (!data.floor || (Number.isInteger(data.floor) && data.floor >= 0 && data.floor <= 20)) &&
            (!data.desks || (Number.isInteger(data.desks) && data.desks >= 0 && data.desks <= 100)) &&
            (!data.chairs || (Number.isInteger(data.chairs) && data.chairs >= 0 && data.chairs <= 100)) &&
            (!data.computers || (Number.isInteger(data.computers) && data.computers >= 0 && data.computers <= 50)) &&
            (data.hasProjector === undefined || typeof data.hasProjector === 'boolean') &&
            (!data.maxStudents || (Number.isInteger(data.maxStudents) && data.maxStudents >= 1 && data.maxStudents <= 100))
        );
    }
} 
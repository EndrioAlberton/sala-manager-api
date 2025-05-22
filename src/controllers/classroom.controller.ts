import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { ClassRoom } from '../model/classroom.modal';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { AdminGuard } from '../guards/admin.guard';

@Controller('classrooms')
export class ClassroomController {
    constructor(
        private readonly classroomService: ClassroomService
    ) {}

    @Post()
    @UseGuards(AdminGuard)
    async create(@Body() classroom: CreateClassroomDto): Promise<ClassRoom> {
        return this.classroomService.create(classroom);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async update(@Param('id') id: number, @Body() classroom: UpdateClassroomDto): Promise<ClassRoom> {
        return this.classroomService.update(id, classroom);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
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
} 
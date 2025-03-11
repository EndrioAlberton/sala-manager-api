import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query, ValidationPipe, UsePipes, HttpException } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { ClassRoom } from '../model/classroom.modal';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { createPromptModule } from 'inquirer';
import { OccupationService } from '../services/occupation.service';
const prompt = createPromptModule();

@ApiTags('classrooms')
@Controller('classrooms')
export class ClassroomController {
    constructor(
        private readonly classroomService: ClassroomService,
        private readonly occupationService: OccupationService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Listar todas as salas' })
    @ApiResponse({ status: 200, description: 'Lista de salas', type: [ClassRoom] })
    async findAll(): Promise<ClassRoom[]> {
        return this.classroomService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Busca salas por número' })
    @ApiQuery({ name: 'roomNumber', description: 'Número da sala' })
    @ApiResponse({ status: 200, description: 'Salas encontradas com sucesso' })
    async searchByRoomNumber(@Query('roomNumber') roomNumber: string): Promise<ClassRoom[]> {
        return this.classroomService.searchByRoomNumber(roomNumber);
    }

    @Get('filter')
    @ApiOperation({ summary: 'Busca salas com filtros' })
    @ApiQuery({ name: 'hasProjector', description: 'Se a sala tem projetor', required: false })
    @ApiQuery({ name: 'minCapacity', description: 'Capacidade mínima de alunos', required: false })
    @ApiQuery({ name: 'maxCapacity', description: 'Capacidade máxima de alunos', required: false })
    @ApiQuery({ name: 'isAvailable', description: 'Se a sala está disponível', required: false })
    @ApiResponse({ status: 200, description: 'Salas encontradas com sucesso' })
    async searchByFilters(
        @Query('hasProjector') hasProjector?: string,
        @Query('minCapacity') minCapacity?: string,
        @Query('maxCapacity') maxCapacity?: string,
        @Query('isAvailable') isAvailable?: string,
    ): Promise<ClassRoom[]> {
        const filters: any = {};

        // Só adiciona os filtros se eles foram fornecidos
        if (hasProjector !== undefined) {
            filters.hasProjector = hasProjector.toLowerCase() === 'true';
        }
        if (minCapacity !== undefined) {
            filters.minCapacity = parseInt(minCapacity);
        }
        if (maxCapacity !== undefined) {
            filters.maxCapacity = parseInt(maxCapacity);
        }
        if (isAvailable !== undefined) {
            filters.isAvailable = isAvailable.toLowerCase() === 'true';
        }

        return this.classroomService.searchByFilters(filters);
    }

    @Get('available')
    @ApiOperation({ summary: 'Lista todas as salas disponíveis' })
    @ApiResponse({ status: 200, description: 'Lista de salas disponíveis retornada com sucesso' })
    async findAvailable(): Promise<ClassRoom[]> {
        return this.classroomService.findAvailable();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar sala por ID' })
    @ApiResponse({ status: 200, description: 'Sala encontrada', type: ClassRoom })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async findOne(@Param('id') id: number): Promise<ClassRoom> {
        return this.classroomService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Criar nova sala' })
    @ApiResponse({ status: 201, description: 'Sala criada com sucesso', type: ClassRoom })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiBody({ type: ClassRoom })
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        if (!this.validateCreate(classroom)) {
            throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
        }
        return this.classroomService.create({
            ...classroom,
            isOccupied: false,
            currentTeacher: null,
            currentSubject: null
        });
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar sala' })
    @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso', type: ClassRoom })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
    async update(@Param('id') id: number, @Body() classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        if (!this.validateUpdate(classroom)) {
            throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
        }
        return this.classroomService.update(id, classroom);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar sala' })
    @ApiResponse({ status: 200, description: 'Sala deletada com sucesso' })
    @ApiResponse({ status: 400, description: 'Sala está ocupada' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async remove(@Param('id') id: number): Promise<void> {
        const classroom = await this.classroomService.findOne(id);
        if (classroom.isOccupied) {
            throw new HttpException('Não é possível deletar uma sala ocupada', HttpStatus.BAD_REQUEST);
        }
        return this.classroomService.remove(id);
    }

    @Put(':id/occupy')
    @ApiOperation({ summary: 'Ocupa uma sala' })
    @ApiParam({ name: 'id', description: 'ID da sala' })
    @ApiResponse({ status: 200, description: 'Sala ocupada com sucesso' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async occupy(
        @Param('id') id: string,
        @Body() data: { teacher: string; subject: string },
    ): Promise<ClassRoom> {
        return this.classroomService.occupy(+id, data.teacher, data.subject);
    }

    @Put(':id/vacate')
    @ApiOperation({ summary: 'Libera uma sala' })
    @ApiParam({ name: 'id', description: 'ID da sala' })
    @ApiResponse({ status: 200, description: 'Sala liberada com sucesso' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async vacate(@Param('id') id: string): Promise<ClassRoom> {
        return this.classroomService.vacate(+id);
    }

    @Post(':id/occupy')
    async occupyRoom(
        @Param('id') id: number,
        @Body() occupyData: {
            startDate: Date;
            endDate: Date;
            startTime: string;
            endTime: string;
            daysOfWeek: number[];
            teacher: string;
            subject: string;
        }
    ) {
        try {
            // Validações básicas
            if (!occupyData.startDate || !occupyData.endDate) {
                throw new HttpException('Datas são obrigatórias', HttpStatus.BAD_REQUEST);
            }

            if (!occupyData.startTime || !occupyData.endTime) {
                throw new HttpException('Horários são obrigatórios', HttpStatus.BAD_REQUEST);
            }

            if (!occupyData.daysOfWeek || occupyData.daysOfWeek.length === 0) {
                throw new HttpException('Selecione pelo menos um dia da semana', HttpStatus.BAD_REQUEST);
            }

            if (!occupyData.teacher || !occupyData.subject) {
                throw new HttpException('Professor e disciplina são obrigatórios', HttpStatus.BAD_REQUEST);
            }

            return this.occupationService.occupyRoom(
                id,
                new Date(occupyData.startDate),
                new Date(occupyData.endDate),
                occupyData.startTime,
                occupyData.endTime,
                occupyData.daysOfWeek,
                occupyData.teacher,
                occupyData.subject
            );
        } catch (error) {
            throw new HttpException(
                error.message || 'Erro ao ocupar sala',
                error.status || HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get(':id/schedule')
    async getSchedule(@Param('id') id: number) {
        try {
            const room = await this.classroomService.findOne(id);
            if (!room) {
                throw new HttpException('Sala não encontrada', HttpStatus.NOT_FOUND);
            }

            return {
                isOccupied: room.isOccupied,
                currentTeacher: room.currentTeacher,
                currentSubject: room.currentSubject,
                schedule: room.isOccupied ? {
                    startDate: room.startDate,
                    endDate: room.endDate,
                    startTime: room.startTime,
                    endTime: room.endTime,
                    daysOfWeek: room.daysOfWeek
                } : null
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Erro ao buscar agenda',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(':id/vacate')
    async vacateRoom(@Param('id') id: number) {
        const room = await this.classroomService.findOne(id);
        if (!room) {
            throw new HttpException('Sala não encontrada', HttpStatus.NOT_FOUND);
        }

        if (!room.isOccupied) {
            throw new HttpException('Sala já está desocupada', HttpStatus.BAD_REQUEST);
        }

        return this.classroomService.update(id, {
            isOccupied: false,
            currentTeacher: null,
            currentSubject: null,
            startDate: null,
            endDate: null,
            startTime: null,
            endTime: null,
            daysOfWeek: null
        });
    }

    @Get(':id/availability')
    async checkAvailability(
        @Param('id') id: number,
        @Body() checkData: {
            startDate: Date;
            endDate: Date;
            startTime: string;
            endTime: string;
            daysOfWeek: number[];
        }
    ) {
        try {
            const isAvailable = await this.occupationService.checkAvailability(
                id,
                new Date(checkData.startDate),
                new Date(checkData.endDate),
                checkData.startTime,
                checkData.endTime,
                checkData.daysOfWeek
            );

            return { available: isAvailable };
        } catch (error) {
            throw new HttpException(
                error.message || 'Erro ao verificar disponibilidade',
                error.status || HttpStatus.BAD_REQUEST
            );
        }
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
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { ClassRoom } from '../model/classroom.modal';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('classrooms')
@Controller('classrooms')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

    @Get()
    @ApiOperation({ summary: 'Lista todas as salas de aula' })
    @ApiResponse({ status: 200, description: 'Lista de salas retornada com sucesso' })
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
    @ApiOperation({ summary: 'Busca uma sala específica' })
    @ApiParam({ name: 'id', description: 'ID da sala' })
    @ApiResponse({ status: 200, description: 'Sala encontrada com sucesso' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async findOne(@Param('id') id: string): Promise<ClassRoom> {
        return this.classroomService.findOne(+id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Cria uma nova sala' })
    @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
    async create(@Body() classroom: Partial<ClassRoom>): Promise<ClassRoom> {
        return this.classroomService.create(classroom);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualiza uma sala existente' })
    @ApiParam({ name: 'id', description: 'ID da sala' })
    @ApiResponse({ status: 200, description: 'Sala atualizada com sucesso' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async update(
        @Param('id') id: string,
        @Body() classroom: Partial<ClassRoom>,
    ): Promise<ClassRoom> {
        return this.classroomService.update(+id, classroom);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove uma sala' })
    @ApiParam({ name: 'id', description: 'ID da sala' })
    @ApiResponse({ status: 204, description: 'Sala removida com sucesso' })
    @ApiResponse({ status: 404, description: 'Sala não encontrada' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.classroomService.remove(+id);
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
} 
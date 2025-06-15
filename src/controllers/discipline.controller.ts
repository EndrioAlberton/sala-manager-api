import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DisciplineService } from '../services/discipline.service';
import { Discipline } from '../model/discipline.modal';
import { CreateDisciplineDto } from '../dto/create-discipline.dto';
import { ProfessorGuard } from '../guards/professor.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('disciplines')
@Controller('disciplines')
export class DisciplineController {
    constructor(
        private readonly disciplineService: DisciplineService
    ) {}

    @Post()
    @UseGuards(ProfessorGuard)
    @ApiOperation({ summary: 'Criar uma nova disciplina' })
    @ApiResponse({ status: 201, description: 'Disciplina criada com sucesso', type: Discipline })
    async create(@Body() discipline: CreateDisciplineDto, @Request() req): Promise<Discipline> {
        return this.disciplineService.create(discipline, req.user.userId);
    }

    @Put(':id')
    @UseGuards(ProfessorGuard)
    @ApiOperation({ summary: 'Atualizar uma disciplina existente' })
    @ApiResponse({ status: 200, description: 'Disciplina atualizada com sucesso', type: Discipline })
    async update(@Param('id') id: number, @Body() discipline: Partial<CreateDisciplineDto>, @Request() req): Promise<Discipline> {
        return this.disciplineService.update(id, discipline, req.user.userId);
    }

    @Delete(':id')
    @UseGuards(ProfessorGuard)
    @ApiOperation({ summary: 'Remover uma disciplina' })
    @ApiResponse({ status: 200, description: 'Disciplina removida com sucesso' })
    async remove(@Param('id') id: number, @Request() req): Promise<void> {
        return this.disciplineService.remove(id, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as disciplinas' })
    @ApiResponse({ status: 200, description: 'Lista de disciplinas retornada com sucesso', type: [Discipline] })
    async findAll(): Promise<Discipline[]> {
        return this.disciplineService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma disciplina específica' })
    @ApiResponse({ status: 200, description: 'Disciplina encontrada com sucesso', type: Discipline })
    async findOne(@Param('id') id: number): Promise<Discipline> {
        return this.disciplineService.findOne(id);
    }

    @Get('professor/:id')
    @ApiOperation({ summary: 'Listar todas as disciplinas de um professor' })
    @ApiResponse({ status: 200, description: 'Lista de disciplinas do professor retornada com sucesso', type: [Discipline] })
    async findByProfessor(@Param('id') professorId: number): Promise<Discipline[]> {
        return this.disciplineService.findByProfessor(professorId);
    }
} 
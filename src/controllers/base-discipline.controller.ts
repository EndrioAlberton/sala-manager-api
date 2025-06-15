import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BaseDisciplineService } from '../services/base-discipline.service';
import { BaseDiscipline } from '../model/base-discipline.modal';
import { AdminGuard } from '../guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('base-disciplines')
@Controller('base-disciplines')
export class BaseDisciplineController {
    constructor(
        private readonly baseDisciplineService: BaseDisciplineService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Listar todas as disciplinas base' })
    @ApiResponse({ status: 200, description: 'Lista de disciplinas base retornada com sucesso', type: [BaseDiscipline] })
    async findAll(): Promise<BaseDiscipline[]> {
        return this.baseDisciplineService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma disciplina base pelo ID' })
    @ApiResponse({ status: 200, description: 'Disciplina base encontrada com sucesso', type: BaseDiscipline })
    async findOne(@Param('id') id: number): Promise<BaseDiscipline> {
        return this.baseDisciplineService.findOne(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Criar uma nova disciplina base' })
    @ApiResponse({ status: 201, description: 'Disciplina base criada com sucesso', type: BaseDiscipline })
    async create(@Body() discipline: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        return this.baseDisciplineService.create(discipline);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Atualizar uma disciplina base' })
    @ApiResponse({ status: 200, description: 'Disciplina base atualizada com sucesso', type: BaseDiscipline })
    async update(@Param('id') id: number, @Body() discipline: Partial<BaseDiscipline>): Promise<BaseDiscipline> {
        return this.baseDisciplineService.update(id, discipline);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Remover uma disciplina base' })
    @ApiResponse({ status: 200, description: 'Disciplina base removida com sucesso' })
    async remove(@Param('id') id: number): Promise<void> {
        return this.baseDisciplineService.remove(id);
    }
} 
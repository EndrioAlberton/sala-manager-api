import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { OccupationService } from '../services/occupation.service';

@Controller('occupations')
export class OccupationController {
    constructor(private readonly occupationService: OccupationService) {}

    @Post()
    async create(@Body() createData: {
        roomId: number;
        teacher: string;
        subject: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }) {
        console.log('=== CONTROLLER: INICIANDO CRIAÇÃO DE OCUPAÇÃO ===');
        console.log('Dados recebidos:', createData);

        try {
            const result = await this.occupationService.create(createData);
            console.log('Ocupação criada com sucesso:', result);
            console.log('=== CONTROLLER: FIM DA CRIAÇÃO DE OCUPAÇÃO ===');
            return result;
        } catch (error) {
            console.error('Erro ao criar ocupação:', error.message);
            console.log('=== CONTROLLER: ERRO NA CRIAÇÃO DE OCUPAÇÃO ===');
            
            if (error.message.includes('Já existe uma ocupação')) {
                throw new HttpException(error.message, HttpStatus.CONFLICT);
            }
            throw error;
        }
    }

    @Get('room/:roomId')
    async findByRoom(@Param('roomId') roomId: number) {
        return this.occupationService.findByRoom(roomId);
    }

    @Get('room/:roomId/current')
    async getCurrentOccupation(@Param('roomId') roomId: number) {
        return this.occupationService.findCurrentOccupation(roomId);
    }

    @Post('check-availability')
    async checkAvailability(@Body() checkData: {
        roomId: number;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }) {
        console.log('=== CONTROLLER: VERIFICANDO DISPONIBILIDADE ===');
        console.log('Dados recebidos:', checkData);

        try {
            const isAvailable = await this.occupationService.checkAvailability(checkData);
            console.log('Resultado da verificação:', { isAvailable });
            console.log('=== CONTROLLER: FIM DA VERIFICAÇÃO DE DISPONIBILIDADE ===');
            return { available: isAvailable };
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error.message);
            console.log('=== CONTROLLER: ERRO NA VERIFICAÇÃO DE DISPONIBILIDADE ===');
            throw error;
        }
    }

    @Get('occupied')
    async getOccupiedRooms(
        @Query('date') date: string,
        @Query('time') time: string
    ) {
        console.log('Recebendo requisição de salas ocupadas:', { date, time });

        // Extrai a data do formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
        const dateOnly = date.split('T')[0];
        const [year, month, day] = dateOnly.split('-').map(Number);
        
        // Cria a data usando os componentes individuais
        const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

        return this.occupationService.findOccupiedRooms(parsedDate, time);
    }
} 
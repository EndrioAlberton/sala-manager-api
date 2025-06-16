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
        return this.occupationService.create(createData);
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
        return {
            available: await this.occupationService.checkAvailability(checkData)
        };
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

        console.log('Data parseada:', {
            dateOnly,
            components: { year, month, day },
            parsedDate: parsedDate.toLocaleDateString('pt-BR'),
            dayOfWeek: parsedDate.getDay()
        });

        return this.occupationService.findOccupiedRooms(parsedDate, time);
    }
} 
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
        try {
            const result = await this.occupationService.create(createData);
            return result;
        } catch (error) {
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
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }) {
        try {
            // Converte as strings de data para objetos Date
            const [startYear, startMonth, startDay] = checkData.startDate.split('-').map(Number);
            const [endYear, endMonth, endDay] = checkData.endDate.split('-').map(Number);
            
            const startDate = new Date(startYear, startMonth - 1, startDay, 12, 0, 0);
            const endDate = new Date(endYear, endMonth - 1, endDay, 12, 0, 0);

            const isAvailable = await this.occupationService.checkAvailability({
                roomId: checkData.roomId,
                startDate,
                endDate,
                startTime: checkData.startTime,
                endTime: checkData.endTime,
                daysOfWeek: checkData.daysOfWeek
            });
            
            return { available: isAvailable };
        } catch (error) {
            throw error;
        }
    }

    @Get('occupied')
    async getOccupiedRooms(
        @Query('date') date: string,
        @Query('time') time: string
    ) {
        // Extrai a data do formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
        const dateOnly = date.split('T')[0];
        const [year, month, day] = dateOnly.split('-').map(Number);
        
        // Cria a data usando os componentes individuais
        const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

        return this.occupationService.findOccupiedRooms(parsedDate, time);
    }
} 
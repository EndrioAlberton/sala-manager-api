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
        console.log('Controller recebeu:', {
            dateReceived: date,
            timeReceived: time
        });

        // Garante que a data está no formato correto
        const parsedDate = new Date(date);
        
        console.log('Data convertida:', {
            parsedDate,
            dayOfWeek: parsedDate.getDay()
        });

        return this.occupationService.findOccupiedRooms(parsedDate, time);
    }
} 
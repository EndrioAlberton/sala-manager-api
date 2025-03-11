import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Occupation } from '../model/occupation.modal';
import { OccupationRepository } from '../repo/occupation.repository';

@Injectable()
export class OccupationService {
    constructor(
        private occupationRepository: OccupationRepository
    ) {}

    async create(data: {
        roomId: number;
        teacher: string;
        subject: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }): Promise<Occupation> {
        // Validações
        if (new Date(data.startDate) > new Date(data.endDate)) {
            throw new HttpException('Data inicial deve ser anterior à data final', HttpStatus.BAD_REQUEST);
        }

        if (data.startTime >= data.endTime) {
            throw new HttpException('Hora inicial deve ser anterior à hora final', HttpStatus.BAD_REQUEST);
        }

        if (!data.daysOfWeek.every(day => day >= 1 && day <= 7)) {
            throw new HttpException('Dias da semana devem estar entre 1 e 7', HttpStatus.BAD_REQUEST);
        }

        // Verifica disponibilidade
        const isAvailable = await this.checkAvailability(data);
        if (!isAvailable) {
            throw new HttpException('Sala já está ocupada neste período', HttpStatus.CONFLICT);
        }

        return this.occupationRepository.create(data);
    }

    async findByRoom(roomId: number): Promise<Occupation[]> {
        return this.occupationRepository.findByRoom(roomId);
    }

    async findCurrentOccupation(roomId: number): Promise<Occupation | null> {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.getDay() || 7; // Converte 0 (domingo) para 7
        
        const occupations = await this.occupationRepository.findCurrentOccupation(
            roomId,
            now,
            currentTime
        );

        return occupations.find(occupation => 
            occupation.daysOfWeek.includes(currentDay) &&
            occupation.startTime <= currentTime &&
            occupation.endTime > currentTime
        ) || null;
    }

    async checkAvailability(data: {
        roomId: number;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }): Promise<boolean> {
        const conflictingOccupations = await this.occupationRepository.findConflictingOccupations(
            data.roomId,
            new Date(data.startDate),
            new Date(data.endDate)
        );

        return !conflictingOccupations.some(occupation => 
            this.hasTimeOverlap(data.startTime, data.endTime, occupation.startTime, occupation.endTime) &&
            this.hasDayOverlap(data.daysOfWeek, occupation.daysOfWeek)
        );
    }

    private hasTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        return start1 < end2 && end1 > start2;
    }

    private hasDayOverlap(days1: number[], days2: number[]): boolean {
        return days1.some(day => days2.includes(day));
    }

    async findOccupiedRooms(date: Date, time: string): Promise<Occupation[]> {
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        const occupations = await this.occupationRepository.findByDateAndTime(date, time);
        
        return occupations.filter(occupation => {
            const daysArray = occupation.daysOfWeek.map(Number);
            const isInDayOfWeek = daysArray.includes(dayOfWeek);
            const isInTimeRange = occupation.startTime <= time && occupation.endTime > time;
            
            return isInDayOfWeek && isInTimeRange;
        });
    }
} 
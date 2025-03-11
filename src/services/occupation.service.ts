import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassroomService } from './classroom.service';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class OccupationService {
    constructor(private classroomService: ClassroomService) {}

    async occupyRoom(
        roomId: number,
        startDate: Date,
        endDate: Date,
        startTime: string,
        endTime: string,
        daysOfWeek: number[],
        teacher: string,
        subject: string
    ) {
        // Validações
        if (new Date(startDate) > new Date(endDate)) {
            throw new Error('Data inicial deve ser anterior à data final');
        }

        if (startTime >= endTime) {
            throw new Error('Hora inicial deve ser anterior à hora final');
        }

        if (!daysOfWeek.every(day => day >= 1 && day <= 7)) {
            throw new Error('Dias da semana devem estar entre 1 (segunda) e 7 (domingo)');
        }

        // Verifica se a sala já está ocupada no período
        const isAvailable = await this.checkAvailability(
            roomId,
            startDate,
            endDate,
            startTime,
            endTime,
            daysOfWeek
        );

        if (!isAvailable) {
            throw new Error('Sala já está ocupada neste período');
        }

        // Ocupa a sala
        return this.classroomService.update(roomId, {
            isOccupied: true,
            currentTeacher: teacher,
            currentSubject: subject,
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            daysOfWeek: daysOfWeek
        });
    }

    async checkAvailability(
        roomId: number,
        startDate: Date,
        endDate: Date,
        startTime: string,
        endTime: string,
        daysOfWeek: number[]
    ): Promise<boolean> {
        const room = await this.classroomService.findOne(roomId);

        if (!room) {
            throw new Error('Sala não encontrada');
        }

        if (room.isOccupied) {
            // Verifica se há sobreposição de horários
            const currentStart = new Date(room.startDate);
            const currentEnd = new Date(room.endDate);
            const newStart = new Date(startDate);
            const newEnd = new Date(endDate);

            if (
                (newStart <= currentEnd && newEnd >= currentStart) &&
                this.hasTimeOverlap(startTime, endTime, room.startTime, room.endTime) &&
                this.hasDayOverlap(daysOfWeek, room.daysOfWeek)
            ) {
                return false;
            }
        }

        return true;
    }

    private hasTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        return start1 < end2 && end1 > start2;
    }

    private hasDayOverlap(days1: number[], days2: number[]): boolean {
        return days1.some(day => days2.includes(day));
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAndUpdateOccupation() {
        const rooms = await this.classroomService.findAll();
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.getDay() || 7; // 0 = domingo -> 7

        for (const room of rooms) {
            if (room.isOccupied && room.endDate) {
                const endDate = new Date(room.endDate);
                
                if (
                    now > endDate || 
                    (now.toDateString() === endDate.toDateString() && currentTime > room.endTime) ||
                    !room.daysOfWeek.includes(currentDay)
                ) {
                    await this.classroomService.update(room.id, {
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
            }
        }
    }
} 
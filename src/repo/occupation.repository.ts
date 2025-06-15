import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, MoreThan } from 'typeorm';
import { Occupation } from '../model/occupation.modal';

@Injectable()
export class OccupationRepository {
    constructor(
        @InjectRepository(Occupation)
        private repository: Repository<Occupation>
    ) {}

    async findAll(): Promise<Occupation[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<Occupation> {
        return this.repository.findOne({
            where: { id }
        });
    }

    async create(data: Partial<Occupation>): Promise<Occupation> {
        const occupation = this.repository.create(data);
        return this.repository.save(occupation);
    }

    async update(id: number, data: Partial<Occupation>): Promise<Occupation> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findByRoom(roomId: number): Promise<Occupation[]> {
        return this.repository.find({
            where: { roomId },
            order: {
                startDate: 'ASC',
                startTime: 'ASC'
            }
        });
    }

    async findCurrentOccupation(roomId: number, currentDate: Date, currentTime: string): Promise<Occupation[]> {
        return this.repository.find({
            where: {
                roomId,
                startDate: LessThanOrEqual(currentDate),
                endDate: MoreThanOrEqual(currentDate)
            }
        });
    }

    async findConflictingOccupations(
        roomId: number,
        startDate: Date,
        endDate: Date
    ): Promise<Occupation[]> {
        // Busca ocupações que se sobrepõem com o período especificado
        return this.repository.find({
            where: {
                roomId,
                startDate: LessThanOrEqual(endDate),
                endDate: MoreThanOrEqual(startDate)
            }
        });
    }

    async findByDateAndTime(date: Date, time: string): Promise<Occupation[]> {
        // Busca ocupações para uma data e horário específicos
        return this.repository.find({
            where: {
                startDate: LessThanOrEqual(date),
                endDate: MoreThanOrEqual(date)
            }
        });
    }

    async createMany(occupations: Partial<Occupation>[]): Promise<Occupation[]> {
        const createdOccupations = this.repository.create(occupations);
        return this.repository.save(createdOccupations);
    }

    async findConflicting(data: {
        roomId: number;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }): Promise<Occupation | null> {
        // Procura por ocupações que se sobrepõem no tempo e têm dias da semana em comum
        const occupations = await this.repository.find({
            where: {
                roomId: data.roomId,
                startDate: LessThanOrEqual(data.endDate),
                endDate: MoreThanOrEqual(data.startDate),
            }
        });

        // Verifica se há sobreposição de horários e dias da semana
        for (const occupation of occupations) {
            // Verifica sobreposição de horários
            const occupationStart = this.timeToMinutes(occupation.startTime);
            const occupationEnd = this.timeToMinutes(occupation.endTime);
            const newStart = this.timeToMinutes(data.startTime);
            const newEnd = this.timeToMinutes(data.endTime);

            const timeOverlap = !(newEnd <= occupationStart || newStart >= occupationEnd);

            // Verifica sobreposição de dias da semana
            const daysOverlap = occupation.daysOfWeek.some(day => data.daysOfWeek.includes(day));

            if (timeOverlap && daysOverlap) {
                return occupation;
            }
        }

        return null;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    async findByTeacherAndSubject(teacher: string, subject: string): Promise<Occupation[]> {
        const currentDate = new Date();
        return this.repository.find({
            where: {
                teacher,
                subject,
                endDate: MoreThan(currentDate)
            }
        });
    }
} 
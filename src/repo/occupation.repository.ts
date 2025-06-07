import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Occupation } from '../model/occupation.modal';

@Injectable()
export class OccupationRepository {
    constructor(
        @InjectRepository(Occupation)
        private repository: Repository<Occupation>
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
        const occupation = this.repository.create(data);
        return this.repository.save(occupation);
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
} 
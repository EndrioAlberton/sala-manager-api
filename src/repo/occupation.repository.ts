import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Occupation } from '../model/occupation.modal';

@Injectable()
export class OccupationRepository {
    constructor(
        @InjectRepository(Occupation)
        private repository: Repository<Occupation>
    ) {}

    async create(data: Partial<Occupation>): Promise<Occupation> {
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
        return this.repository.find({
            where: {
                roomId,
                startDate: LessThanOrEqual(endDate),
                endDate: MoreThanOrEqual(startDate)
            }
        });
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findOne(id: number): Promise<Occupation> {
        return this.repository.findOne({ where: { id } });
    }

    async findByDateAndTime(date: Date, time: string): Promise<Occupation[]> {
        // Formata a data para YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        console.log('Data formatada:', formattedDate);

        const occupations = await this.repository
            .createQueryBuilder('occupation')
            .where(`DATE(occupation.startDate) <= DATE(:date)`, { 
                date: formattedDate
            })
            .andWhere(`DATE(occupation.endDate) >= DATE(:date)`, { 
                date: formattedDate
            })
            .getMany();

        // Debug da query
        const query = this.repository.createQueryBuilder('occupation')
            .where(`DATE(occupation.startDate) <= DATE(:date)`, { 
                date: formattedDate
            })
            .andWhere(`DATE(occupation.endDate) >= DATE(:date)`, { 
                date: formattedDate
            })
            .getSql();

        console.log('SQL Query:', query);
        console.log('Ocupações encontradas:', occupations);

        return occupations;
    }
} 
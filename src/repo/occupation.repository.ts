import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
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

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async find(options: any): Promise<Occupation[]> {
        return this.repository.find(options);
    }

    async findByRoom(roomId: number): Promise<Occupation[]> {
        const currentDate = new Date();
        return this.repository.find({
            where: {
                roomId,
                endDate: MoreThanOrEqual(currentDate)
            },
            order: {
                startDate: 'ASC',
                startTime: 'ASC'
            }
        });
    }

    async findCurrentOccupation(roomId: number): Promise<Occupation[]> {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const currentTime = currentDate.toLocaleTimeString('pt-BR', { hour12: false }).substring(0, 5);

        const occupations = await this.repository.find({
            where: {
                roomId,
                startDate: LessThanOrEqual(currentDate),
                endDate: MoreThanOrEqual(currentDate)
            }
        });

        return occupations.filter(occupation => {
            return occupation.daysOfWeek.includes(currentDay) &&
                   occupation.startTime <= currentTime &&
                   occupation.endTime > currentTime;
        });
    }

    async findConflictingOccupations(
        roomId: number,
        startDate: Date,
        endDate: Date
    ): Promise<Occupation[]> {
        // Cria novas datas mantendo o dia exato
        const searchStartDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );
        
        const searchEndDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
        );

        // Busca ocupações que se sobrepõem com o período especificado
        return this.repository.find({
            where: {
                roomId,
                startDate: LessThanOrEqual(searchEndDate),
                endDate: MoreThanOrEqual(searchStartDate)
            },
            order: {
                startDate: 'ASC',
                startTime: 'ASC'
            }
        });
    }

    async findByDateAndTime(date: Date, time: string): Promise<Occupation[]> {
        console.log('Buscando no repositório:', {
            date: date.toLocaleDateString('pt-BR'),
            time
        });

        // Cria nova data mantendo o dia exato
        const searchDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12, 0, 0
        );

        console.log('Data de busca:', {
            searchDate: searchDate.toLocaleDateString('pt-BR')
        });

        // Busca ocupações que incluem a data especificada
        const occupations = await this.repository.find({
            where: [
                {
                    startDate: LessThanOrEqual(searchDate),
                    endDate: MoreThanOrEqual(searchDate)
                }
            ]
        });

        console.log('Ocupações encontradas no banco:', occupations.map(o => ({
            id: o.id,
            roomId: o.roomId,
            startDate: o.startDate.toLocaleDateString('pt-BR'),
            endDate: o.endDate.toLocaleDateString('pt-BR'),
            startTime: o.startTime,
            endTime: o.endTime,
            daysOfWeek: o.daysOfWeek
        })));

        // Filtra as ocupações pelo horário
        const filteredOccupations = occupations.filter(occupation => {
            // Converte os horários para minutos para comparação
            const [searchHour, searchMinute] = time.split(':').map(Number);
            const searchTimeInMinutes = searchHour * 60 + searchMinute;

            const [startHour, startMinute] = occupation.startTime.split(':').map(Number);
            const [endHour, endMinute] = occupation.endTime.split(':').map(Number);
            
            const startTimeInMinutes = startHour * 60 + startMinute;
            const endTimeInMinutes = endHour * 60 + endMinute;

            // Verifica se o horário está dentro do intervalo
            const timeMatches = searchTimeInMinutes >= startTimeInMinutes && searchTimeInMinutes < endTimeInMinutes;

            console.log('Verificando horários:', {
                id: occupation.id,
                searchTime: time,
                startTime: occupation.startTime,
                endTime: occupation.endTime,
                timeMatches
            });

            return timeMatches;
        });

        console.log('Ocupações após filtro de horário:', filteredOccupations.length);

        return filteredOccupations;
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
                endDate: MoreThanOrEqual(currentDate)
            }
        });
    }

    async count(): Promise<number> {
        return this.repository.count();
    }
} 
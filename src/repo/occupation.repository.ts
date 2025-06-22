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
        // 1. Busca todas as ocupações da sala
        const occupations = await this.repository.find({
            where: { 
                roomId: data.roomId,
                startDate: data.startDate // Busca apenas ocupações no mesmo dia
            }
        });

        if (occupations.length === 0) {
            return null; // Se não há ocupações neste dia, não há conflito
        }

        // 2. Converte os horários da nova ocupação para minutos para comparação
        const [newStartHour, newStartMinute] = data.startTime.split(':').map(Number);
        const [newEndHour, newEndMinute] = data.endTime.split(':').map(Number);
        const newStartMinutes = newStartHour * 60 + newStartMinute;
        const newEndMinutes = newEndHour * 60 + newEndMinute;

        // 3. Verifica se alguma ocupação existente conflita com o horário
        for (const occupation of occupations) {
            // Converte os horários da ocupação existente para minutos
            const [existingStartHour, existingStartMinute] = occupation.startTime.split(':').map(Number);
            const [existingEndHour, existingEndMinute] = occupation.endTime.split(':').map(Number);
            const existingStartMinutes = existingStartHour * 60 + existingStartMinute;
            const existingEndMinutes = existingEndHour * 60 + existingEndMinute;

            // Verifica se há sobreposição de horários
            const hasTimeOverlap = (
                (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) || // Novo início durante ocupação existente
                (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) || // Novo fim durante ocupação existente
                (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes) // Nova ocupação engloba ocupação existente
            );

            // Se encontrou sobreposição de horário, retorna a ocupação conflitante
            if (hasTimeOverlap) {
                return occupation;
            }
        }

        // Se chegou aqui, não encontrou conflitos
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

    async findByRoomId(roomId: number): Promise<Occupation[]> {
        const currentDate = new Date();
        
        return this.repository.find({
            where: {
                roomId: roomId,
                endDate: MoreThanOrEqual(currentDate) // Busca apenas ocupações que ainda não terminaram
            }
        });
    }
} 
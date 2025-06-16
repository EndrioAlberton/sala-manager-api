import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { OccupationRepository } from '../repo/occupation.repository';
import { ClassroomRepository } from '../repo/classroom.repository';
import { DisciplineRepository } from '../repo/discipline.repository';
import { UserRepository } from '../repo/user.repository';
import { Occupation } from '../model/occupation.modal';
import { UserType } from '../model/user.modal';

@Injectable()
export class OccupationService {
    constructor(
        private readonly occupationRepository: OccupationRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly disciplineRepository: DisciplineRepository,
        private readonly userRepository: UserRepository,
    ) {}

    private generateDatesFromRange(startDate: Date, endDate: Date, daysOfWeek: number[]): Date[] {
        const dates: Date[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const currentDayOfWeek = currentDate.getDay();
            
            if (daysOfWeek.includes(currentDayOfWeek)) {
                dates.push(new Date(currentDate));
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    async create(data: {
        roomId: number;
        teacher: string;
        subject: string;
        startDate: string | Date;
        endDate: string | Date;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
    }): Promise<Occupation> {
        const room = await this.classroomRepository.findOne(data.roomId);
        if (!room) {
            throw new NotFoundException('Sala não encontrada');
        }

        const teacher = await this.userRepository.findByEmail(data.teacher);
        if (!teacher) {
            throw new NotFoundException('Professor não encontrado');
        }

        if (teacher.userType !== UserType.PROFESSOR) {
            throw new BadRequestException('Apenas professores podem criar ocupações');
        }

        // Converte as datas para string ISO caso sejam objetos Date
        const startDateStr = typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString();
        const endDateStr = typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString();

        console.log('Dados recebidos:', {
            startDate: data.startDate,
            endDate: data.endDate,
            startDateStr,
            endDateStr
        });

        // Extrai a data do formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
        const startDateOnly = startDateStr.split('T')[0];
        const endDateOnly = endDateStr.split('T')[0];

        // Extrai os componentes da data do formato YYYY-MM-DD
        const [startYear, startMonth, startDay] = startDateOnly.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDateOnly.split('-').map(Number);

        console.log('Componentes das datas:', {
            start: { startDay, startMonth, startYear },
            end: { endDay, endMonth, endYear }
        });

        // Cria as datas usando os componentes individuais para preservar o dia exato
        const startDate = new Date(startYear, startMonth - 1, startDay, 12, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay, 12, 0, 0);

        console.log('Datas criadas (raw):', {
            startDate,
            endDate,
            startTime: startDate.getTime(),
            endTime: endDate.getTime()
        });

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Datas inválidas');
        }

        console.log('Datas finais:', { 
            startDate: startDate.toLocaleDateString('pt-BR'),
            endDate: endDate.toLocaleDateString('pt-BR')
        });

        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;

        if (startTimeMinutes >= endTimeMinutes) {
            throw new BadRequestException('Horário inicial deve ser menor que o horário final');
        }

        if (startHour < 7 || startHour >= 23) {
            throw new BadRequestException('Horário inicial deve ser entre 7:00 e 23:00');
        }
        if (endHour < 7 || endHour > 23) {
            throw new BadRequestException('Horário final deve ser entre 7:00 e 23:00');
        }

        if (!data.daysOfWeek.length) {
            throw new BadRequestException('Selecione pelo menos um dia da semana');
        }

        const isAvailable = await this.checkAvailability({
            roomId: data.roomId,
            startDate,
            endDate,
            startTime: data.startTime,
            endTime: data.endTime,
            daysOfWeek: data.daysOfWeek
        });

        if (!isAvailable) {
            throw new BadRequestException('Já existe uma ocupação em algum dos horários selecionados');
        }

        const occupation = await this.occupationRepository.create({
            roomId: data.roomId,
            teacher: data.teacher,
            subject: data.subject,
            startDate,
            endDate,
            startTime: data.startTime,
            endTime: data.endTime,
            daysOfWeek: data.daysOfWeek.sort((a, b) => a - b) 
        });

        return occupation;
    }

    async findByRoom(roomId: number): Promise<Occupation[]> {
        return this.occupationRepository.findByRoom(roomId);
    }

    async findCurrentOccupation(roomId: number): Promise<Occupation | null> {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.getDay() || 7;
        
        const occupations = await this.occupationRepository.findCurrentOccupation(roomId);

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
        // Converte os horários para minutos para uma comparação
        const [start1Hour, start1Minute] = start1.split(':').map(Number);
        const [end1Hour, end1Minute] = end1.split(':').map(Number);
        const [start2Hour, start2Minute] = start2.split(':').map(Number);
        const [end2Hour, end2Minute] = end2.split(':').map(Number);

        const start1Minutes = start1Hour * 60 + start1Minute;
        const end1Minutes = end1Hour * 60 + end1Minute;
        const start2Minutes = start2Hour * 60 + start2Minute;
        const end2Minutes = end2Hour * 60 + end2Minute;

        // Verifica se há sobreposição
        return (start1Minutes < end2Minutes && end1Minutes > start2Minutes);
    }

    private hasDayOverlap(days1: number[], days2: number[]): boolean {
        return days1.some(day => days2.includes(day));
    }

    async findOccupiedRooms(date: Date, time: string): Promise<Occupation[]> {
        // Pega o dia da semana (0-6, onde 0 é domingo)
        const dayOfWeek = date.getDay();
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
        
        // Busca todas as ocupações que incluem a data e horário
        const occupations = await this.occupationRepository.findByDateAndTime(date, time);
        
        // Filtra apenas as ocupações que acontecem no dia da semana atual
        const filteredOccupations = occupations.filter(occupation => {
            // Converte os dias da semana de string para número
            const daysOfWeekAsNumbers = occupation.daysOfWeek.map(day => Number(day));
            return daysOfWeekAsNumbers.includes(dayOfWeek);
        });

        return filteredOccupations;
    }
} 
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
            // Ajusta o dia da semana para corresponder ao formato usado no frontend
            // 0 = domingo no JavaScript Date, mas usamos 0-6 no frontend
            const currentDayOfWeek = currentDate.getDay();
            
            if (daysOfWeek.includes(currentDayOfWeek)) {
                dates.push(new Date(currentDate));
            }
            
            // Avança para o próximo dia
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

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
        // Verifica se a sala existe
        const classroom = await this.classroomRepository.findOne(data.roomId);
        if (!classroom) {
            throw new NotFoundException(`Sala com ID ${data.roomId} não encontrada`);
        }

        // Verifica se o professor existe e é realmente um professor
        const professor = await this.userRepository.findByEmail(data.teacher);
        if (!professor) {
            throw new NotFoundException(`Professor com email ${data.teacher} não encontrado`);
        }
        if (professor.userType !== UserType.PROFESSOR) {
            throw new BadRequestException(`Usuário com email ${data.teacher} não é um professor`);
        }

        // Verifica se a disciplina pertence ao professor
        const professorDisciplines = await this.disciplineRepository.findByProfessor(professor.id);
        const disciplineExists = professorDisciplines.some(d => d.baseDiscipline.name === data.subject);
        if (!disciplineExists) {
            throw new BadRequestException(`A disciplina ${data.subject} não está cadastrada para o professor ${data.teacher}`);
        }

        // Verifica se já existe ocupação para a sala no mesmo horário
        const existingOccupation = await this.occupationRepository.findConflicting({
            roomId: data.roomId,
            startDate: data.startDate,
            endDate: data.endDate,
            startTime: data.startTime,
            endTime: data.endTime,
            daysOfWeek: data.daysOfWeek
        });

        if (existingOccupation) {
            throw new BadRequestException('Já existe uma ocupação para esta sala neste horário');
        }

        // Validações
        if (new Date(data.startDate) > new Date(data.endDate)) {
            throw new HttpException('Data inicial deve ser anterior à data final', HttpStatus.BAD_REQUEST);
        }

        if (data.startTime >= data.endTime) {
            throw new HttpException('Hora inicial deve ser anterior à hora final', HttpStatus.BAD_REQUEST);
        }

        if (!data.daysOfWeek.length) {
            throw new HttpException('Selecione pelo menos um dia da semana', HttpStatus.BAD_REQUEST);
        }

        // Gera as datas específicas baseadas no intervalo e dias da semana
        const dates = this.generateDatesFromRange(
            new Date(data.startDate),
            new Date(data.endDate),
            data.daysOfWeek
        );

        if (dates.length === 0) {
            throw new HttpException(
                'Nenhuma data gerada para os dias da semana selecionados no intervalo especificado',
                HttpStatus.BAD_REQUEST
            );
        }

        // Verifica disponibilidade para cada data gerada
        for (const date of dates) {
            const isAvailable = await this.checkAvailability({
                ...data,
                startDate: date,
                endDate: date
            });

            if (!isAvailable) {
                throw new HttpException(
                    `Sala já está ocupada para a data ${date.toLocaleDateString()}`,
                    HttpStatus.CONFLICT
                );
            }
        }

        // Cria uma ocupação para cada data gerada
        const occupations = dates.map(date => ({
            ...data,
            startDate: date,
            endDate: date,
            daysOfWeek: [date.getDay()]
        }));

        const createdOccupations = await this.occupationRepository.createMany(occupations);
        return createdOccupations[0];
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
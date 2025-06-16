import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repo/user.repository';
import { ClassroomRepository } from '../repo/classroom.repository';
import { DisciplineRepository } from '../repo/discipline.repository';
import { BaseDisciplineRepository } from '../repo/base-discipline.repository';
import { OccupationRepository } from '../repo/occupation.repository';
import { UserType } from '../model/user.modal';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly disciplineRepository: DisciplineRepository,
        private readonly baseDisciplineRepository: BaseDisciplineRepository,
        private readonly occupationRepository: OccupationRepository,
    ) {}

    async seed() {
        await this.seedUsers();
        await this.seedClassrooms();
        await this.seedBaseDisciplines();
        await this.seedDisciplines();
        await this.seedOccupations();
    }

    async seedUsers() {
        const users = [
            {
                name: 'Admin Sistema',
                email: 'admin@escola.com',
                password: await bcrypt.hash('admin123', 10),
                userType: UserType.ADMIN,
            },
            {
                name: 'João Silva',
                email: 'joao.silva@escola.com',
                password: await bcrypt.hash('prof123', 10),
                userType: UserType.PROFESSOR,
            },
            {
                name: 'Maria Santos',
                email: 'maria.santos@escola.com',
                password: await bcrypt.hash('prof123', 10),
                userType: UserType.PROFESSOR,
            },
            {
                name: 'Pedro Alves',
                email: 'pedro.alves@escola.com',
                password: await bcrypt.hash('aluno123', 10),
                userType: UserType.ALUNO,
            }
        ];

        for (const user of users) {
            const existingUser = await this.userRepository.findByEmail(user.email);
            if (!existingUser) {
                await this.userRepository.create(user);
            }
        }
    }

    async seedClassrooms() {
        const classRooms = [
            {
                roomNumber: '101',
                floor: 1,
                building: 'Bloco A',
                desks: 30,
                chairs: 30,
                computers: 0,
                hasProjector: true,
                maxStudents: 30
            },
            {
                roomNumber: '102',
                floor: 1,
                building: 'Bloco A',
                desks: 35,
                chairs: 35,
                computers: 0,
                hasProjector: true,
                maxStudents: 35
            },
            {
                roomNumber: '201',
                floor: 2,
                building: 'Bloco A',
                desks: 40,
                chairs: 40,
                computers: 20,
                hasProjector: true,
                maxStudents: 40
            },
            {
                roomNumber: '202',
                floor: 2,
                building: 'Bloco A',
                desks: 25,
                chairs: 25,
                computers: 25,
                hasProjector: true,
                maxStudents: 25
            },
            {
                roomNumber: '301',
                floor: 3,
                building: 'Bloco B',
                desks: 45,
                chairs: 45,
                computers: 0,
                hasProjector: true,
                maxStudents: 45
            },
            {
                roomNumber: '302',
                floor: 3,
                building: 'Bloco B',
                desks: 30,
                chairs: 30,
                computers: 30,
                hasProjector: true,
                maxStudents: 30
            }
        ];

        for (const room of classRooms) {
            const existingRooms = await this.classroomRepository.searchByRoomNumber(room.roomNumber);
            const existingRoom = existingRooms.find(r => r.building === room.building);
            if (!existingRoom) {
                await this.classroomRepository.create(room);
            }
        }
    }

    async seedBaseDisciplines() {
        const baseDisciplines = [
            {
                name: 'Matemática',
                code: 'MAT001',
                description: 'Matemática do Ensino Médio',
                area: 'Exatas'
            },
            {
                name: 'Física',
                code: 'FIS001',
                description: 'Física do Ensino Médio',
                area: 'Exatas'
            },
            {
                name: 'Química',
                code: 'QUI001',
                description: 'Química do Ensino Médio',
                area: 'Exatas'
            },
            {
                name: 'Biologia',
                code: 'BIO001',
                description: 'Biologia do Ensino Médio',
                area: 'Ciências'
            },
            {
                name: 'História',
                code: 'HIS001',
                description: 'História Geral',
                area: 'Humanas'
            },
            {
                name: 'Geografia',
                code: 'GEO001',
                description: 'Geografia Geral',
                area: 'Humanas'
            },
            {
                name: 'Português',
                code: 'POR001',
                description: 'Língua Portuguesa',
                area: 'Linguagens'
            },
            {
                name: 'Inglês',
                code: 'ING001',
                description: 'Língua Inglesa',
                area: 'Linguagens'
            }
        ];

        for (const discipline of baseDisciplines) {
            const existing = await this.baseDisciplineRepository.findByCode(discipline.code);
            if (!existing) {
                await this.baseDisciplineRepository.create(discipline);
            }
        }
    }

    async seedDisciplines() {
        const joao = await this.userRepository.findByEmail('joao.silva@escola.com');
        const maria = await this.userRepository.findByEmail('maria.santos@escola.com');

        if (!joao || !maria) return;

        const matematica = await this.baseDisciplineRepository.findByCode('MAT001');
        const fisica = await this.baseDisciplineRepository.findByCode('FIS001');
        const quimica = await this.baseDisciplineRepository.findByCode('QUI001');
        const biologia = await this.baseDisciplineRepository.findByCode('BIO001');

        if (!matematica || !fisica || !quimica || !biologia) return;

        const disciplines = [
            {
                baseDisciplineId: matematica.id,
                professorId: joao.id
            },
            {
                baseDisciplineId: fisica.id,
                professorId: joao.id
            },
            {
                baseDisciplineId: quimica.id,
                professorId: maria.id
            },
            {
                baseDisciplineId: biologia.id,
                professorId: maria.id
            }
        ];

        for (const discipline of disciplines) {
            const existingDisciplines = await this.disciplineRepository.findAll();
            const existing = existingDisciplines.find(d => 
                d.baseDisciplineId === discipline.baseDisciplineId && 
                d.professorId === discipline.professorId
            );

            if (!existing) {
                await this.disciplineRepository.create(discipline);
            }
        }
    }

    async seedOccupations() {
        // Verifica se já existem ocupações
        const existingCount = await this.occupationRepository.count();
        if (existingCount > 0) {
            return; // Se já existem ocupações, não faz nada
        }

        const occupations = [
            {
                roomId: 1,
                teacher: 'joao.silva@escola.com',
                subject: 'Matemática',
                startDate: new Date('2025-06-14'),
                endDate: new Date('2025-07-29'),
                startTime: '07:30',
                endTime: '09:10',
                daysOfWeek: [2] // Terça
            },
            {
                roomId: 2,
                teacher: 'maria.santos@escola.com',
                subject: 'Química',
                startDate: new Date('2025-06-14'),
                endDate: new Date('2025-07-29'),
                startTime: '08:00',
                endTime: '09:40',
                daysOfWeek: [2] // Terça
            },
            {
                roomId: 3,
                teacher: 'joao.silva@escola.com',
                subject: 'Física',
                startDate: new Date('2025-06-14'),
                endDate: new Date('2025-07-29'),
                startTime: '09:20',
                endTime: '11:00',
                daysOfWeek: [2] // Terça
            },
            {
                roomId: 4,
                teacher: 'maria.santos@escola.com',
                subject: 'Biologia',
                startDate: new Date('2025-06-14'),
                endDate: new Date('2025-07-29'),
                startTime: '09:50',
                endTime: '11:30',
                daysOfWeek: [2] // Terça
            }
        ];

        // Cria todas as ocupações de uma vez
        await this.occupationRepository.createMany(occupations);
    }
}

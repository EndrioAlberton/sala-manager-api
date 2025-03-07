import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRoom } from '../model/classroom.modal';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(ClassRoom)
        private classRoomRepository: Repository<ClassRoom>,
    ) {}

    async seedClassRooms() {
        const classRooms = [
            {
                floor: 1,
                building: 'Prédio A',
                desks: 30,
                chairs: 30,
                computers: 15,
                projectors: 1,
                maxStudents: 30,
                isOccupied: false,
            },
            {
                floor: 2,
                building: 'Prédio A',
                desks: 40,
                chairs: 40,
                computers: 20,
                projectors: 2,
                maxStudents: 40,
                isOccupied: false,
            },
            {
                floor: 1,
                building: 'Prédio B',
                desks: 25,
                chairs: 25,
                computers: 12,
                projectors: 1,
                maxStudents: 25,
                isOccupied: false,
            },
            {
                floor: 3,
                building: 'Prédio A',
                desks: 35,
                chairs: 35,
                computers: 18,
                projectors: 1,
                maxStudents: 35,
                isOccupied: false,
            },
            {
                floor: 2,
                building: 'Prédio B',
                desks: 45,
                chairs: 45,
                computers: 22,
                projectors: 2,
                maxStudents: 45,
                isOccupied: false,
            },
        ];

        for (const room of classRooms) {
            const existingRoom = await this.classRoomRepository.findOne({
                where: {
                    floor: room.floor,
                    building: room.building,
                },
            });

            if (!existingRoom) {
                await this.classRoomRepository.save(room);
                console.log(`Sala criada: ${room.building} - ${room.floor}º andar`);
            }
        }
    }
} 
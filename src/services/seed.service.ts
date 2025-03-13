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
                roomNumber: '101',
                floor: 1,
                building: 'Prédio A',
                desks: 30,
                chairs: 30,
                computers: 15,
                hasProjector: true,
                maxStudents: 30,
                isOccupied: false,
            },
            {
                roomNumber: '201',
                floor: 2,
                building: 'Prédio A',
                desks: 40,
                chairs: 40,
                computers: 20,
                hasProjector: true,
                maxStudents: 40,
                isOccupied: false,
            },
            {
                roomNumber: '102',
                floor: 1,
                building: 'Prédio B',
                desks: 25,
                chairs: 25,
                computers: null,
                hasProjector: true,
                maxStudents: 25,
                isOccupied: false,
            },
            {
                roomNumber: '301',
                floor: 3,
                building: 'Prédio A',
                desks: 35,
                chairs: 35,
                computers: 18,
                hasProjector: false,
                maxStudents: 35,
                isOccupied: false,
            },
            {
                roomNumber: '202',
                floor: 2,
                building: 'Prédio B',
                desks: 45,
                chairs: 45,
                computers: null,
                hasProjector: false,
                maxStudents: 45,
                isOccupied: false,
            },
        ];

        for (const room of classRooms) {
            const existingRoom = await this.classRoomRepository.findOne({
                where: {
                    roomNumber: room.roomNumber,
                    building: room.building,
                },
            });

            if (!existingRoom) {
                await this.classRoomRepository.save(room);
            }
        }
    }
} 
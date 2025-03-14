import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max, IsBoolean, IsOptional, MaxLength } from 'class-validator';

@Entity()
export class ClassRoom {
    @ApiProperty({ description: 'ID único da sala' })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Número da sala' })
    @Column()
    roomNumber: string; // número da sala

    @ApiProperty({ description: 'Número do andar' })
    @Column()
    floor: number; // andar

    @ApiProperty({ description: 'Nome do prédio' })
    @Column()
    building: string; // prédio

    @ApiProperty({ description: 'Quantidade de mesas' })
    @Column()
    desks: number; // número de mesas

    @ApiProperty({ description: 'Quantidade de cadeiras' })
    @Column()
    chairs: number; // número de cadeiras

    @ApiProperty({ description: 'Quantidade de computadores', required: false })
    @Column({ nullable: true })
    computers: number; // número de computadores

    @ApiProperty({ description: 'Indica se a sala possui projetor' })
    @Column()
    hasProjector: boolean; // se tem projetor

    @ApiProperty({ description: 'Capacidade máxima de alunos' })
    @Column()
    maxStudents: number; // quantidade máxima de alunos
} 
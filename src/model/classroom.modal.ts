import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ClassRoom {
    @ApiProperty({ description: 'ID único da sala' })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Número da sala' })
    @Column()
    roomNumber: string; 

    @ApiProperty({ description: 'Número do andar' })
    @Column()
    floor: number; 

    @ApiProperty({ description: 'Nome do prédio' })
    @Column()
    building: string;

    @ApiProperty({ description: 'Quantidade de mesas' })
    @Column()
    desks: number; 

    @ApiProperty({ description: 'Quantidade de cadeiras' })
    @Column()
    chairs: number; 

    @ApiProperty({ description: 'Quantidade de computadores', required: false })
    @Column({ nullable: true })
    computers: number; 

    @ApiProperty({ description: 'Indica se a sala possui projetor' })
    @Column()
    hasProjector: boolean; 

    @ApiProperty({ description: 'Capacidade máxima de alunos' })
    @Column()
    maxStudents: number;
} 
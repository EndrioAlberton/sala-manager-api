import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.modal';
import { BaseDiscipline } from './base-discipline.modal';

@Entity()
export class Discipline {
    @ApiProperty({ description: 'ID único da disciplina' })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'ID da disciplina base' })
    @Column()
    baseDisciplineId: number;

    @ApiProperty({ description: 'ID do professor responsável' })
    @Column()
    professorId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'professorId' })
    professor: User;

    @ManyToOne(() => BaseDiscipline)
    @JoinColumn({ name: 'baseDisciplineId' })
    baseDiscipline: BaseDiscipline;
} 
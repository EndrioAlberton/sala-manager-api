import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class BaseDiscipline {
    @ApiProperty({ description: 'ID único da disciplina base' })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Nome da disciplina' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Código da disciplina' })
    @Column()
    code: string;

    @ApiProperty({ description: 'Descrição da disciplina' })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ description: 'Área da disciplina (ex: Exatas, Humanas, etc)' })
    @Column()
    area: string;
} 
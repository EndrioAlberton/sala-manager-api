import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({ description: 'ID único do usuário' })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Nome do usuário' })
    @Column()
    name: string; 

    @ApiProperty({ description: 'E-mail do usuário' })
    @Column({ unique: true })
    email: string; 

    @ApiProperty({ description: 'Senha do usuário' })
    @Column()
    password: string;

    @ApiProperty({ description: 'Tipo de usuário (admin, aluno ou professor)' })
    @Column()
    userType: string;
}















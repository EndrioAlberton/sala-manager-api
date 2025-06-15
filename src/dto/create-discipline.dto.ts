import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDisciplineDto {
    @ApiProperty({ 
        description: 'ID do professor responsável',
        example: 1,
        required: true
    })
    @IsNotEmpty({ message: 'ID do professor é obrigatório' })
    @IsNumber({}, { message: 'ID do professor deve ser um número' })
    professorId: number;

    @ApiProperty({ 
        description: 'ID da disciplina base',
        example: 1,
        required: true
    })
    @IsNotEmpty({ message: 'ID da disciplina base é obrigatório' })
    @IsNumber({}, { message: 'ID da disciplina base deve ser um número' })
    baseDisciplineId: number;
} 
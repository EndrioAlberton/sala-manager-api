import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsBoolean, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateClassroomDto {
    @ApiProperty({ 
        description: 'Número da sala',
        example: 'A101',
        minLength: 1,
        maxLength: 10,
        required: false
    })
    @IsOptional()
    @MaxLength(10, { message: 'Número da sala deve ter no máximo 10 caracteres' })
    roomNumber?: string;

    @ApiProperty({ 
        description: 'Andar da sala',
        example: 1,
        minimum: 0,
        maximum: 20,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'Andar deve ser um número inteiro' })
    @Min(0, { message: 'Andar deve ser maior ou igual a 0' })
    @Max(20, { message: 'Andar deve ser menor ou igual a 20' })
    floor?: number;

    @ApiProperty({ 
        description: 'Nome do prédio',
        example: 'Bloco A',
        minLength: 1,
        maxLength: 50,
        required: false
    })
    @IsOptional()
    @MaxLength(50, { message: 'Nome do prédio deve ter no máximo 50 caracteres' })
    building?: string;

    @ApiProperty({ 
        description: 'Quantidade de mesas',
        example: 30,
        minimum: 0,
        maximum: 100,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'Quantidade de mesas deve ser um número inteiro' })
    @Min(0, { message: 'Quantidade de mesas deve ser maior ou igual a 0' })
    @Max(100, { message: 'Quantidade de mesas deve ser menor ou igual a 100' })
    desks?: number;

    @ApiProperty({ 
        description: 'Quantidade de cadeiras',
        example: 30,
        minimum: 0,
        maximum: 100,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'Quantidade de cadeiras deve ser um número inteiro' })
    @Min(0, { message: 'Quantidade de cadeiras deve ser maior ou igual a 0' })
    @Max(100, { message: 'Quantidade de cadeiras deve ser menor ou igual a 100' })
    chairs?: number;

    @ApiProperty({ 
        description: 'Quantidade de computadores',
        example: 20,
        minimum: 0,
        maximum: 50,
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsInt({ message: 'Quantidade de computadores deve ser um número inteiro' })
    @Min(0, { message: 'Quantidade de computadores deve ser maior ou igual a 0' })
    @Max(50, { message: 'Quantidade de computadores deve ser menor ou igual a 50' })
    computers?: number;

    @ApiProperty({ 
        description: 'Possui projetor',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean({ message: 'Projetor deve ser um valor booleano' })
    hasProjector?: boolean;

    @ApiProperty({ 
        description: 'Capacidade máxima de alunos',
        example: 40,
        minimum: 1,
        maximum: 100,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'Capacidade deve ser um número inteiro' })
    @Min(1, { message: 'Capacidade deve ser maior ou igual a 1' })
    @Max(100, { message: 'Capacidade deve ser menor ou igual a 100' })
    maxStudents?: number;
} 
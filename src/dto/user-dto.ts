import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UserDto {
    @ApiProperty({
        description: 'O nome do usuário',
        example: 'Fulado de Tal',
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    @IsNotEmpty({ message: 'O nome do usuário é obrigatório' })
    @MaxLength(50, { message: 'O nome do usuário deve ter no máximo 50 caracteres' })
    name: string;

    @ApiProperty({
        description: 'A senha do usuário',
        example: '********',
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    @IsNotEmpty({ message: 'A senha do usuário é obrigatória' })
    @MaxLength(50, { message: 'A senha do usuário deve ter no máximo 50 caracteres' })
    password: string;

    @ApiProperty({
        description: 'O tipo de usuário (admin, aluno ou professor)',
        example: 'admin',
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    @IsNotEmpty({ message: 'O tipo de usuário é obrigatório' })
    @MaxLength(50, { message: 'O tipo de usuário deve ter no máximo 50 caracteres' })
    userType: string;

    @ApiProperty({
        description: 'O email do usuário',
        example: 'usuario@email.com',
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    @IsNotEmpty({ message: 'O email do usuário é obrigatório' })
    @MaxLength(50, { message: 'O email do usuário deve ter no máximo 50 caracteres' })
    email: string;
}
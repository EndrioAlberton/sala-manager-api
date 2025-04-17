import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserType } from '../model/user.modal';
import { UserRepository } from '../repo/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
    ) {}

    // GET /users
    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    // GET /users/:id
    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne(id);
        if (!user) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        return user;
    }

    // POST /users/register
    async register(userData: { name: string; email: string; password: string }): Promise<User> {
        console.log(`Tentativa de registro para: ${userData.email}`);
        
        // Verificar se o email já está em uso
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            console.log(`Email já em uso: ${userData.email}`);
            throw new ConflictException('Este email já está em uso');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Criar o usuário (sempre como ALUNO por padrão)
        const newUser = await this.userRepository.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            userType: UserType.ALUNO
        });
        
        console.log(`Usuário registrado com sucesso: ${newUser.email}`);
        return newUser;
    }

    // POST /users/login
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        console.log(`Tentativa de login para email: ${email}`);
        
        if (!email || !password) {
            console.log('Email ou senha faltando');
            throw new NotFoundException('E-mail e senha são obrigatórios');
        }
        
        // Buscar usuário pelo e-mail (não pelo nome de usuário)
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            console.log(`Usuário não encontrado para email: ${email}`);
            throw new NotFoundException('E-mail não encontrado');
        }
        
        console.log(`Usuário encontrado: ${user.name}, verificando senha...`);
        console.log(`Senha fornecida: ${password.slice(0, 1)}${'*'.repeat(password.length - 1)}`); 

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log(`Resultado da verificação de senha: ${isPasswordValid ? 'válida' : 'inválida'}`);
            
            if (!isPasswordValid) {
                console.log(`Senha inválida para o usuário: ${user.email}`);
                throw new NotFoundException('Senha inválida');
            }
        } catch (error) {
            console.log('Erro ao comparar senhas:', error);
            throw new NotFoundException('Erro ao verificar senha');
        }

        console.log(`Autenticação bem-sucedida para: ${user.email}`);
        
        // Token simples para simular autenticação
        const token = "token-simulado-" + Date.now();

        return { user, token };
    }

    // PUT /users/:id
    async update(id: number, userData: Partial<User>): Promise<User> {
        await this.findOne(id);
        
        // Se a senha for atualizada, deve ser feito o hash
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        
        return this.userRepository.update(id, userData);
    }

    // DELETE /users/:id
    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.userRepository.remove(id);
    }

    // PUT /users/:id/type
    async updateUserType(id: number, userType: UserType): Promise<User> {
        // Verificar se o usuário existe
        await this.findOne(id);
        
        // Atualizar apenas o tipo de usuário
        return this.userRepository.update(id, { userType });
    }
} 
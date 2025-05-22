import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User, UserType } from '../model/user.modal';
import { UserRepository } from '../repo/user.repository';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

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
    async register(userData: { name: string; email: string; password: string, userType?: string }): Promise<User> {
        // Verificar se o email já está em uso
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Este email já está em uso');
        }

        // Validar o tipo de usuário
        const userType = userData.userType?.toUpperCase() || UserType.ALUNO;
        if (!Object.values(UserType).includes(userType as UserType)) {
            throw new BadRequestException(`Tipo de usuário inválido: ${userData.userType}`);
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Criar o usuário
        const newUser = await this.userRepository.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            userType: userType as UserType
        });
        
        return newUser;
    }

    // POST /users/login
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        if (!email || !password) {
            throw new NotFoundException('E-mail e senha são obrigatórios');
        }
        
        // Buscar usuário pelo e-mail
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException('E-mail não encontrado');
        }
        
        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                throw new NotFoundException('Senha inválida');
            }
        } catch (error) {
            throw new NotFoundException('Erro ao verificar senha');
        }
        
        // Gerar token JWT com informações do usuário
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                userType: user.userType
            },
            process.env.JWT_SECRET || 'sua_chave_secreta',
            { expiresIn: '24h' }
        );

        // Remover a senha antes de retornar o usuário
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword as User, token };
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
} 
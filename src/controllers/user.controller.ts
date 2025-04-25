import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException, ConflictException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../model/user.modal';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Post('register')
    async register(@Body() userData: { name: string; email: string; password: string }): Promise<User> {
        return this.userService.register(userData);
    }

    @Post('login')
    async login(@Body() credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
        // Login por e-mail e senha
        console.log('Requisição de login recebida:', { email: credentials.email });
        console.log('Body completo recebido:', JSON.stringify(credentials, null, 2));
        
        if (!credentials.email || !credentials.password) {
            console.log('Credenciais incompletas:', { email: !!credentials.email, password: !!credentials.password });
            throw new BadRequestException('E-mail e senha são obrigatórios');
        }
        
        try {
            console.log('Tentando autenticar com e-mail:', credentials.email);
            const result = await this.userService.login(credentials.email, credentials.password);
            console.log('Login bem-sucedido para:', credentials.email);
            
            // Remover a senha do objeto de usuário antes de retornar
            const user = result.user;
            delete user.password;
            
            return { user, token: result.token };
        } catch (error) {
            console.log('Erro no login:', error.message);
            if (error instanceof NotFoundException) {
                throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
        return this.userService.update(id, userData);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.userService.remove(id);
    }
} 
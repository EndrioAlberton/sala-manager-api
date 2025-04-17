import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException, ConflictException } from '@nestjs/common';
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
        return this.userService.login(credentials.email, credentials.password);
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
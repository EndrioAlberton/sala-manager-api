import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoom } from '../model/classroom.modal';
import { SeedService } from '../services/seed.service';
import { User } from '../model/user.modal';

@Module({
    imports: [TypeOrmModule.forFeature([ClassRoom, User])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {} 
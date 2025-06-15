import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoom } from '../model/classroom.modal';
import { SeedService } from '../services/seed.service';
import { User } from '../model/user.modal';
import { Occupation } from '../model/occupation.modal';
import { Discipline } from '../model/discipline.modal';

@Module({
    imports: [TypeOrmModule.forFeature([ClassRoom, User, Occupation, Discipline])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {} 
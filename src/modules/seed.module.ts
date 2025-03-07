import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoom } from '../model/ClassRoom';
import { SeedService } from '../services/seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([ClassRoom])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDiscipline } from '../model/base-discipline.modal';
import { BaseDisciplineController } from '../controllers/base-discipline.controller';
import { BaseDisciplineService } from '../services/base-discipline.service';
import { BaseDisciplineRepository } from '../repo/base-discipline.repository';

@Module({
    imports: [TypeOrmModule.forFeature([BaseDiscipline])],
    controllers: [BaseDisciplineController],
    providers: [BaseDisciplineService, BaseDisciplineRepository],
    exports: [BaseDisciplineService, BaseDisciplineRepository]
})
export class BaseDisciplineModule {} 
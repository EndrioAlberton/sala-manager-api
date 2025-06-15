import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Occupation } from '../model/occupation.modal';
import { OccupationRepository } from '../repo/occupation.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Occupation])],
    providers: [OccupationRepository],
    exports: [OccupationRepository]
})
export class OccupationModule {} 
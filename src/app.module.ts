import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './model/user.modal';
import { ClassRoom } from './model/classroom.modal';
import { Occupation } from './model/occupation.modal';
import { Discipline } from './model/discipline.modal';
import { BaseDiscipline } from './model/base-discipline.modal';
import { UserController } from './controllers/user.controller';
import { ClassroomController } from './controllers/classroom.controller';
import { OccupationController } from './controllers/occupation.controller';
import { DisciplineController } from './controllers/discipline.controller';
import { BaseDisciplineController } from './controllers/base-discipline.controller';
import { UserService } from './services/user.service';
import { ClassroomService } from './services/classroom.service';
import { OccupationService } from './services/occupation.service';
import { DisciplineService } from './services/discipline.service';
import { BaseDisciplineService } from './services/base-discipline.service';
import { SeedService } from './services/seed.service';
import { UserRepository } from './repo/user.repository';
import { ClassroomRepository } from './repo/classroom.repository';
import { OccupationRepository } from './repo/occupation.repository';
import { DisciplineRepository } from './repo/discipline.repository';
import { BaseDisciplineRepository } from './repo/base-discipline.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'eng3',
      entities: [User, ClassRoom, Discipline, BaseDiscipline, Occupation],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, ClassRoom, Discipline, BaseDiscipline, Occupation]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    UserController,
    ClassroomController, 
    OccupationController,
    DisciplineController,
    BaseDisciplineController,
  ],
  providers: [
    UserService,
    ClassroomService,
    OccupationService,
    DisciplineService,
    BaseDisciplineService,
    SeedService,
    UserRepository,
    ClassroomRepository,
    OccupationRepository,
    DisciplineRepository,
    BaseDisciplineRepository
  ],
})
export class AppModule {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
} 
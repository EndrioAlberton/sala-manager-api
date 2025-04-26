import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoom } from './model/classroom.modal';
import { SeedModule } from './modules/seed.module';
import { SeedService } from './services/seed.service';
import { ClassroomController } from './controllers/classroom.controller';
import { ClassroomService } from './services/classroom.service';
import { ClassroomRepository } from './repo/classroom.repository';
import { OccupationService } from './services/occupation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Occupation } from './model/occupation.modal';
import { OccupationController } from './controllers/occupation.controller';
import { OccupationRepository } from './repo/occupation.repository';
import { User } from './model/user.modal';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repo/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'eng3',
      entities: [ClassRoom, Occupation, User],
      synchronize: false, // Não use em produção
      logging: true,
    }),
    TypeOrmModule.forFeature([ClassRoom, Occupation, User]),
    SeedModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ClassroomController, 
    OccupationController,
    UserController
  ],
  providers: [
    ClassroomService, 
    ClassroomRepository, 
    SeedService,
    OccupationService,
    OccupationRepository,
    UserService,
    UserRepository
  ],
})
export class AppModule {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seedClassRooms();
    await this.seedService.seedUsers();
  }
} 
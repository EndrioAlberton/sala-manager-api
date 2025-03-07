import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRoom } from './model/classroom.modal';
import { SeedModule } from './modules/seed.module';
import { SeedService } from './services/seed.service';
import { ClassroomController } from './controllers/classroom.controller';
import { ClassroomService } from './services/classroom.service';
import { ClassroomRepository } from './repo/classroom.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'eng3',
      entities: [ClassRoom],
      synchronize: true, // Não use em produção
      logging: true,
    }),
    TypeOrmModule.forFeature([ClassRoom]),
    SeedModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService, ClassroomRepository],
})
export class AppModule {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seedClassRooms();
  }
} 
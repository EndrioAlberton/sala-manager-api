import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClassRoom } from './model/classroom.modal';
import { SeedModule } from './modules/seed.module';
import { SeedService } from './services/seed.service';
import { ClassroomController } from './controllers/classroom.controller';
import { ClassroomService } from './services/classroom.service';
import { ClassroomRepository } from './repo/classroom.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ClassRoom],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false
      }
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
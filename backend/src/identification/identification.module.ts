import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentificationService } from './identification.service';
import { IdentificationController } from './identification.controller';
import { Identification } from './entities/identification.entity';

// el módulo de identificación es responsable de manejar la lógica relacionada con las identificaciones, incluyendo la creación, almacenamiento y recuperación de identificaciones. 
// Este módulo utiliza TypeORM para interactuar con la base de datos y tiene un controlador para manejar las solicitudes HTTP relacionadas con las identificaciones.

@Module({
  imports: [TypeOrmModule.forFeature([Identification])],
  controllers: [IdentificationController],
  providers: [IdentificationService],
})
export class IdentificationModule {}
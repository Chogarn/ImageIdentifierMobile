import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
  Query,
  Get,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdentificationService } from './identification.service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@Controller('identification')
export class IdentificationController {
  constructor(
    private readonly identificationService: IdentificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('identify')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES } }),
  )
  async identify(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    return this.identificationService.identify(
      file.buffer,
      file.mimetype,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req, @Query('tipo') tipo?: string) {
    return this.identificationService.getHistory(req.user.userId, tipo);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.identificationService.getOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.identificationService.remove(id, req.user.userId);
  }
}
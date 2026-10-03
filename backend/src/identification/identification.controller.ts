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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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

  // devuelve la foto de una identificación. Límite más alto que el global
  // porque la colección pide muchas miniaturas de golpe (no llama a Gemini).
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 300, ttl: 60000 } })
  @Get(':id/image')
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const imageFile = await this.identificationService.getImageFile(
      id,
      req.user.userId,
    );

    // la foto de una identificación no cambia nunca: el teléfono puede cachearla.
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.sendFile(
      imageFile,
      { root: this.identificationService.uploadsDir },
      (err) => {
        // ej: la fila existe pero el archivo se borró a mano de la carpeta.
        if (err && !res.headersSent) {
          res.status(404).json({ message: 'Foto no encontrada' });
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.identificationService.remove(id, req.user.userId);
  }
}
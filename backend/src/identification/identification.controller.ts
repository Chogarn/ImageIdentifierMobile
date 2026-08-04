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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdentificationService } from './identification.service';

@Controller('identification')
export class IdentificationController {
  constructor(
    private readonly identificationService: IdentificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('identify')
  @UseInterceptors(FileInterceptor('image'))
  async identify(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
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

}
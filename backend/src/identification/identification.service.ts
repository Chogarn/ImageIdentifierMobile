import {
  Injectable,
  BadGatewayException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Identification } from './entities/identification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

// formatos de foto que se guardan en disco. Otros tipos (ej: svg) se identifican igual,
// pero no se guardan: servirlos de vuelta podría ser inseguro.
const STORABLE_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

// la interfaz IdentificationResult define la estructura de los datos que se esperan recibir del modelo de IA generativa. 
// Esta interfaz asegura que los datos tengan el formato correcto antes de ser guardados en la base de datos.
export interface IdentificationResult {
  tipo: 'planta' | 'animal' | 'desconocido';
  nombreComun: string;
  nombreCientifico: string;
  familia: string;
  descripcion: string;
  nivelConfianza: string;
}

// el servicio de identificación es responsable de manejar la lógica relacionada con las identificaciones, incluyendo la comunicación con el modelo de IA generativa y la interacción con la base de datos.
@Injectable()
export class IdentificationService {
  private readonly genAI: GoogleGenerativeAI;
  // timestamps (ms) de las últimas llamadas a Gemini, para el cupo por minuto.
  // vive en memoria del proceso: alcanza para un proyecto personal de un solo backend.
  private geminiCallTimestamps: number[] = [];
  // carpeta donde se guardan las fotos subidas (configurable con UPLOADS_DIR).
  readonly uploadsDir: string;

  // el constructor del servicio de identificación inyecta el ConfigService para acceder a las variables de entorno y el repositorio de identificaciones para interactuar con la base de datos.
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Identification)
    private readonly identificationRepository: Repository<Identification>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey as string);
    this.uploadsDir = resolve(
      this.configService.get<string>('UPLOADS_DIR') ?? 'uploads',
    );
  }

  // corta ANTES de llamar a Gemini si nos acercamos al free tier (diario o por minuto),
  // dejando margen bajo los límites reales documentados por Google.
  private async ensureWithinGeminiFreeTier(): Promise<void> {
    const dailyLimit = Number(
      this.configService.get<string>('GEMINI_DAILY_LIMIT') ?? 800,
    );
    const rpmLimit = Number(
      this.configService.get<string>('GEMINI_RPM_LIMIT') ?? 8,
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await this.identificationRepository.count({
      where: { createdAt: Between(startOfDay, endOfDay) },
      // incluye las borradas: borrar del historial no devuelve cupo de Gemini.
      withDeleted: true,
    });

    if (todayCount >= dailyLimit) {
      throw new HttpException(
        'Se alcanzó el límite diario de identificaciones. Probá de nuevo mañana.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const now = Date.now();
    this.geminiCallTimestamps = this.geminiCallTimestamps.filter(
      (ts) => now - ts < 60_000,
    );

    if (this.geminiCallTimestamps.length >= rpmLimit) {
      throw new HttpException(
        'Demasiadas identificaciones en poco tiempo. Esperá un minuto y probá de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.geminiCallTimestamps.push(now);
  }

  // el método identify recibe una imagen, la procesa utilizando el modelo de IA generativa y guarda el resultado en la base de datos.
  async identify(
    imageBuffer: Buffer,
    mimeType: string,
    userId: string,
  ): Promise<Identification> {
    // corta acá si estamos cerca del free tier de Gemini, antes de gastar una llamada real.
    await this.ensureWithinGeminiFreeTier();

    // se configura el modelo de IA generativa con el tipo de respuesta esperada y el esquema de la respuesta. Esto asegura que los datos recibidos del modelo tengan el formato correcto.
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object' as any,
          properties: {
            tipo: { type: 'string', enum: ['planta', 'animal', 'desconocido'] },
            nombreComun: { type: 'string' },
            nombreCientifico: { type: 'string' },
            familia: { type: 'string' },
            descripcion: { type: 'string' },
            nivelConfianza: { type: 'string', enum: ['alto', 'medio', 'bajo'] },
          },
          required: [
            'tipo',
            'nombreComun',
            'nombreCientifico',
            'familia',
            'descripcion',
            'nivelConfianza',
          ],
        } as any,
      },
    });

    // se define el prompt que se enviará al modelo de IA generativa. Este prompt indica al modelo que analice la imagen y determine si muestra una planta, un animal o si es desconocido, y que proporcione una descripción breve.
    const prompt = `Analizá la imagen y determiná si muestra una planta o un animal. Si no es ninguna de las dos cosas, usá "desconocido" y completá el resto con "No determinado". La descripción debe tener máximo 2 oraciones.`;

    // se prepara la imagen para ser enviada al modelo de IA generativa, convirtiéndola a base64 y especificando su tipo MIME. 
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    };

    // se envía el prompt y la imagen al modelo de IA generativa y se espera la respuesta. La respuesta se parsea a un objeto IdentificationResult.
    try {
      
      const result = await model.generateContent([prompt, imagePart]);
      const parsed: IdentificationResult = JSON.parse(result.response.text());

      // la foto se guarda recién cuando Gemini respondió bien, para no dejar archivos huérfanos.
      const imageFile = await this.storeImage(imageBuffer, mimeType);

      const newIdentification = this.identificationRepository.create({
        ...parsed,
        imageFile,
        userId,
      });

      try {
        return await this.identificationRepository.save(newIdentification);
      } catch (saveError) {
        if (imageFile) {
          await unlink(join(this.uploadsDir, imageFile)).catch(() => {});
        }
        throw saveError;
      }

    } catch (error) {
      console.error('Error en identificación:', error);
      throw new BadGatewayException(
        'Error al procesar la imagen con el servicio de identificación',
      );
    }
  }

  // guarda la foto en la carpeta de uploads y devuelve el nombre del archivo, o null si el formato no se guarda.
  private async storeImage(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<string | null> {
    const extension = STORABLE_IMAGE_EXTENSIONS[mimeType];
    if (!extension) {
      return null;
    }

    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.uploadsDir, { recursive: true });
    await writeFile(join(this.uploadsDir, fileName), imageBuffer);
    return fileName;
  }

  // devuelve el nombre del archivo de la foto de una identificación del usuario, o 404 si no tiene foto.
  async getImageFile(id: string, userId: string): Promise<string> {
    const found = await this.getOne(id, userId);

    if (!found.imageFile) {
      throw new NotFoundException('Esta identificación no tiene foto');
    }

    return found.imageFile;
  }

  // el método getHistory recupera el historial de identificaciones de un usuario, opcionalmente filtrando por tipo de identificación.  
  async getHistory(userId: string, tipo?: string): Promise<Identification[]> {
    const where: { userId: string; tipo?: string } = { userId };

    if (tipo) {
      where.tipo = tipo;
    }

    return this.identificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

  }

  // el método getOne devuelve una identificación del usuario, o 404 si no existe o no es suya.
  async getOne(id: string, userId: string): Promise<Identification> {
    const found = await this.identificationRepository.findOne({
      where: { id, userId },
    });

    if (!found) {
      throw new NotFoundException('Identificación no encontrada');
    }

    return found;
  }

  // el método remove oculta una identificación del historial (borrado lógico). Solo el dueño puede borrarla.
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.identificationRepository.softDelete({
      id,
      userId,
    });

    if (!result.affected) {
      throw new NotFoundException('Identificación no encontrada');
    }
  }
}
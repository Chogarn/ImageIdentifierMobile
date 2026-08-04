import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Identification } from './entities/identification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  // el constructor del servicio de identificación inyecta el ConfigService para acceder a las variables de entorno y el repositorio de identificaciones para interactuar con la base de datos.
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Identification)
    private readonly identificationRepository: Repository<Identification>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey as string);
  }

  // el método identify recibe una imagen, la procesa utilizando el modelo de IA generativa y guarda el resultado en la base de datos.
  async identify(
    imageBuffer: Buffer,
    mimeType: string,
    userId: string,
  ): Promise<Identification> {

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

      const newIdentification = this.identificationRepository.create({
        ...parsed,
        userId,
      });

      return await this.identificationRepository.save(newIdentification);

    } catch (error) {
      console.error('Error en identificación:', error);
      throw new BadGatewayException(
        'Error al procesar la imagen con el servicio de identificación',
      );
    }
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
}
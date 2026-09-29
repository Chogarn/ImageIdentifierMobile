import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdentificationService } from './identification.service';
import { Identification } from './entities/identification.entity';

describe('IdentificationService', () => {
  let service: IdentificationService;
  const repository = {
    softDelete: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentificationService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getRepositoryToken(Identification), useValue: repository },
      ],
    }).compile();

    service = module.get<IdentificationService>(IdentificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('hace borrado lógico solo de una identificación del usuario', async () => {
      repository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('id-1', 'user-1');

      expect(repository.softDelete).toHaveBeenCalledWith({
        id: 'id-1',
        userId: 'user-1',
      });
    });

    it('lanza 404 si no existe o no es del usuario', async () => {
      repository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('id-1', 'user-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getOne', () => {
    it('lanza 404 si no existe o no es del usuario', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getOne('id-1', 'user-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});

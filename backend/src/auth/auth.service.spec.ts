import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  const usersRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('devuelve el usuario completo sin la contraseña', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'u1',
        nombre: 'Bruno',
        apellido: 'Muzzio',
        email: 'b@x.com',
        nombreUsuario: 'bruno',
        telefono: null,
        password: 'hash-secreto',
      });

      const profile = await service.getProfile('u1');

      expect(profile).toMatchObject({ id: 'u1', nombre: 'Bruno' });
      expect(profile).not.toHaveProperty('password');
    });

    it('lanza 401 si el usuario ya no existe', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('u1')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// datos del usuario que se le devuelven a la app (nunca incluye la contraseña).
function toPublicUser(user: User) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    nombreUsuario: user.nombreUsuario,
    telefono: user.telefono,
  };
}


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, nombreUsuario, password } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { nombreUsuario }],
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con ese email o nombre de usuario',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: toPublicUser(user),
    };
  }

  // el token solo trae id y email; acá se lee el usuario completo para que la app
  // tenga nombre, apellido, etc. también al restaurar la sesión.
  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return toPublicUser(user);
  }
}
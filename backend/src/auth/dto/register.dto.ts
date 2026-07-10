import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
    @IsString()
    nombre!: string;

  @IsNotEmpty()
    @IsString()
    apellido!: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsNotEmpty()
    @IsString()
    nombreUsuario!: string;

  @IsNotEmpty()
    @IsEmail()
    email!: string;

  @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;
}
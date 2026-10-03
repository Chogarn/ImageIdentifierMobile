export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  telefono?: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  telefono?: string;
  nombreUsuario: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Identification {
  id: string;
  tipo: 'planta' | 'animal' | 'desconocido';
  nombreComun: string;
  nombreCientifico: string;
  familia: string;
  descripcion: string;
  nivelConfianza: 'alto' | 'medio' | 'bajo';
  // null en las identificaciones de antes de que se guardaran las fotos.
  imageFile?: string | null;
  createdAt?: string;
}

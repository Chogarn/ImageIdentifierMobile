import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// esta es la tabla de identificaciones, que tiene una relación con la tabla de usuarios. Cada identificación pertenece a un usuario y se elimina en cascada si el usuario es eliminado.

@Entity('identifications')
export class Identification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tipo!: string;

  @Column()
  nombreComun!: string;

  @Column()
  nombreCientifico!: string;

  @Column()
  familia!: string;

  @Column('text')
  descripcion!: string;

  @Column()
  nivelConfianza!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // borrado lógico: la fila queda en la base pero oculta del historial.
  // así el tope diario anti-costo de Gemini sigue contando lo ya consumido.
  @DeleteDateColumn()
  deletedAt?: Date;
}
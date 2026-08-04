import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column()
    nombre!: string;

  @Column()
    apellido!: string;

  @Column({ nullable: true })
    telefono!: string;

  @Column({ unique: true })
    nombreUsuario!: string;

  @Column({ unique: true })
    email!: string;

  @Column()
    password!: string;

  @CreateDateColumn()
    createdAt!: Date;
}
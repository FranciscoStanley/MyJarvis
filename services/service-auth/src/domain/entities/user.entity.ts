import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, AuthSource } from '@myjarvis/shared';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column()
  name!: string;

  @Column({ type: 'varchar', default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', default: 'local' })
  authSource!: AuthSource;

  @Column({ type: 'varchar', nullable: true })
  ldapDn!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  termsAcceptedAt!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  termsVersion!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

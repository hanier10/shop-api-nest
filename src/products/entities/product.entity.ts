import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'numeric' })
  price: number;
}

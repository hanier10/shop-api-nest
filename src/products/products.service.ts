import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  //Metodo para crear un producto
  async create(productoDto: CreateProductDto) {
    const product = this.productRepository.create(productoDto);
    await this.productRepository.save(product);

    return product;
  }

  //Metodo para visualizar todos los productos
  findAll() {
    return this.productRepository.find();
  }

  //Metodo para visualizar un producto especifico
  findOne(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  //Remover un producto especifico
  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return 'Producto eliminado satisfactoriamente';
  }

  //Actualizar un producto especifico
  async update(id: string, cambios: CreateProductDto) {
    const findProduct = await this.findOne(id);
    const updatedProducto = await this.productRepository.merge(
      findProduct,
      cambios,
    );

    return this.productRepository.save(updatedProducto);
  }
}

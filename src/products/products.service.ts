import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/product.dto';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  //Metodo para crear un producto
  /*   async create(productoDto: CreateProductDto) {
    const product = this.productRepository.create(productoDto);
    await this.productRepository.save(product);

    return product;
  } */
  async create(productoDto: CreateProductDto) {
    const { images = [], ...detalleProducto } = productoDto;
    const product = await this.productRepository.create({
      ...detalleProducto,
      images: images.map((image) =>
        this.imageRepository.create({ url: image }),
      ),
    });
    await this.productRepository.save(product);
    return product;
  }

  //Metodo para visualizar todos los productos
  findAll() {
    return this.productRepository.find({
      relations: ['images'],
    });
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
  // async update(id: string, cambios: CreateProductDto) {
  //   const findProduct = await this.findOne(id);
  //   const updatedProducto = await this.productRepository.merge(
  //     findProduct,
  //     cambios,
  //   );

  //   return this.productRepository.save(updatedProducto);
  // }
  async update(id: string, cambios: CreateProductDto) {
    const { images, ...updateAll } = cambios;
    const product = await this.productRepository.preload({
      id: id,
      ...updateAll,
    });

    //Consultar a la base de datos para modificarla
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    //Si vienen nuevas imagenes, que se eliminen las anteriores
    if (images) {
      await queryRunner.manager.delete(ProductImage, { product: { id } });

      //Si vienen nuevas imagenes que las agregue a la tabla de ProductImage
      product.images = images.map((image) =>
        this.imageRepository.create({ url: image }),
      );
    } else {
      product.images = await this.imageRepository.findBy({ product: { id } });
    }

    //Salvamos y cerramos la consulta
    await queryRunner.manager.save(product);
    await queryRunner.commitTransaction();
    await queryRunner.release();
    return product;
  }
}

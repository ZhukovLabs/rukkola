import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { MinioService } from '../modules/minio/minio.service';
import sharp from 'sharp';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('--- Starting BlurDataURL Generator ---');

  const productModel = app.get<Model<Product>>(getModelToken(Product.name));
  const minioService = app.get(MinioService);

  const products = await productModel.find({
    image: { $exists: true, $ne: null },
    blurDataURL: { $exists: false }
  });

  console.log(`Found ${products.length} products needing blurDataURL.`);

  for (const product of products) {
    console.log(`Processing product: ${product.name} (${product._id})`);
    
    try {
      if (!product.image) continue;

      const fileName = product.image.split('/').pop();
      if (!fileName) {
        console.error(`Could not parse filename from ${product.image}`);
        continue;
      }

      const decodedFileName = decodeURIComponent(fileName);
      const objectName = `products/${decodedFileName}`;

      let buffer = await minioService.getFile(objectName);
      if (!buffer) {
        // Try without products/ prefix
        buffer = await minioService.getFile(decodedFileName);
      }

      if (!buffer) {
        console.error(`Could not find image in MinIO: ${objectName}`);
        continue;
      }

      const blurBuffer = await sharp(buffer)
        .resize(10, 10, { fit: 'inside' })
        .webp({ quality: 20 })
        .toBuffer();
      
      const blurDataURL = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

      await productModel.updateOne(
        { _id: product._id },
        { $set: { blurDataURL } }
      );

      console.log(`Success: Generated blurDataURL for ${product.name}`);
    } catch (error) {
      console.error(`Error processing ${product.name}:`, error);
    }
  }

  console.log('--- Finished ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Critical error in script:', err);
  process.exit(1);
});

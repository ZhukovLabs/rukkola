import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LRUCache } from 'lru-cache';
import sharp from 'sharp';
import { Lunch } from '../../schemas/lunch.schema';
import { MinioService } from '../minio/minio.service';
import { optimizeImage } from '../../common/utils/image-optimize';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class LunchesService {
  private imageCache = new LRUCache<string, { buffer: Buffer; contentType: string }>({
    max: 200,
  });

  constructor(
    @InjectModel(Lunch.name) private lunchModel: Model<Lunch>,
    private minioService: MinioService,
  ) {}

  async getAllLunches() {
    return this.lunchModel.find().sort({ createdAt: -1 }).lean();
  }

  async uploadLunch(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Размер файла превышает 10MB');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(`.${ext}`)) {
      throw new BadRequestException('Неподдерживаемый формат файла');
    }

    const fileName = `lunch-${Date.now()}.webp`;

    const optimizedBuffer = await optimizeImage(file.buffer, { quality: 80 });
    await this.minioService.uploadFile(`lunches/${fileName}`, optimizedBuffer, 'image/webp');

    const imageUrl = `/api/lunches/image/${encodeURIComponent(fileName)}`;

    const lunch = new this.lunchModel({ image: imageUrl });
    await lunch.save();

    return { image: imageUrl, id: lunch._id.toString() };
  }

  async deleteLunch(id: string) {
    const lunch = await this.lunchModel.findById(id);
    if (!lunch) throw new NotFoundException('Обед не найден');

    if (lunch.image) {
      const fileName = lunch.image.split('/').pop();
      if (fileName) {
        try {
          await this.minioService.deleteFile(
            `lunches/${decodeURIComponent(fileName)}`,
          );
        } catch {
          // File may not exist in storage
        }
      }
    }

    await this.lunchModel.deleteOne({ _id: id });

    return { success: true };
  }

  async activateLunch(id: string) {
    const lunch = await this.lunchModel.findById(id);
    if (!lunch) throw new NotFoundException('Обед не найден');

    await this.lunchModel.updateMany({}, { $set: { active: false } });
    lunch.active = true;
    await lunch.save();

    return {
      _id: lunch._id.toString(),
      image: lunch.image,
      active: lunch.active,
    };
  }

  async deactivateAll() {
    await this.lunchModel.updateMany({}, { $set: { active: false } });
    return { success: true };
  }

  async serveImage(filename: string, width?: number) {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('Имя файла не указано');
    }

    const decodedFilename = decodeURIComponent(filename);

    if (decodedFilename.includes('..') || decodedFilename.includes('/')) {
      throw new BadRequestException('Некорректное имя файла');
    }

    const objectName = `lunches/${decodedFilename}`;
    const cacheKey = `${objectName}-${width || 'original'}`;

    const cached = this.imageCache.get(cacheKey);
    if (cached) return cached;

    let originalBuffer = await this.minioService.getFile(objectName);
    if (!originalBuffer) {
      originalBuffer = await this.minioService.getFile(decodedFilename);
    }
    if (!originalBuffer) {
      console.error(`[serveImage] File not found in MinIO: "${objectName}" and "${decodedFilename}"`);
      throw new NotFoundException('Файл не найден');
    }

    let fileBuffer = originalBuffer;

    if (width && width > 0) {
      fileBuffer = Buffer.from(
        await sharp(originalBuffer)
          .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
      );
    }

    const result = { buffer: fileBuffer, contentType: 'image/webp' };
    this.imageCache.set(cacheKey, result);

    return result;
  }
}

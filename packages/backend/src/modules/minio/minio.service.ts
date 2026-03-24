import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client!: Minio.Client;
  private bucketName!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY must be set');
    }

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      accessKey,
      secretKey,
      useSSL,
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'rukkola')!;
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName);
      await this.client.setBucketPolicy(
        this.bucketName,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        }),
      );
    }
  }

  async uploadFile(
    objectName: string,
    buffer: Buffer,
    contentType: string = 'image/webp',
  ): Promise<string> {
    await this.ensureBucket();
    await this.client.putObject(this.bucketName, objectName, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    return objectName;
  }

  async getFile(objectName: string): Promise<Buffer | null> {
    try {
      const stream = await this.client.getObject(this.bucketName, objectName);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      return Buffer.concat(chunks);
    } catch {
      return null;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

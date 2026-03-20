import sharp from 'sharp';

export interface OptimizeOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}

export async function optimizeImage(
    buffer: Buffer,
    options: OptimizeOptions = {}
): Promise<Buffer> {
    const { width = 1920, height, quality = 80, format = 'webp' } = options;

    let pipeline = sharp(buffer)
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        });

    switch (format) {
        case 'jpeg':
            pipeline = pipeline.jpeg({ quality, mozjpeg: true });
            break;
        case 'png':
            pipeline = pipeline.png({ quality, compressionLevel: 9 });
            break;
        case 'webp':
            pipeline = pipeline.webp({ quality });
            break;
    }

    return pipeline.toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
    return sharp(buffer).metadata();
}
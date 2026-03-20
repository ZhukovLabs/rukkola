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

    const pipeline = sharp(buffer);
    await pipeline.metadata();

    let image = sharp(buffer).withMetadata();

    image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
    });

    switch (format) {
        case 'jpeg':
            image = image.jpeg({ quality, mozjpeg: true });
            break;
        case 'png':
            image = image.png({ quality, compressionLevel: 9 });
            break;
        case 'webp':
            image = image.webp({ quality });
            break;
    }

    return image.toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
    return sharp(buffer).metadata();
}
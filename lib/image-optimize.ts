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
    const metadata = await pipeline.metadata();

    const rotationMap: Record<number, number> = {
        3: 180,
        5: 90,
        6: 270,
        7: 180,
        8: 90,
    };
    const rotation = metadata.orientation ? rotationMap[metadata.orientation] : undefined;

    let image = sharp(buffer);
    if (rotation) {
        image = image.rotate(rotation);
    }

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
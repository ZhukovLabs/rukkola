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
    const { quality = 80, format = 'webp' } = options;

    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    const maxWidth = 1920;
    const maxHeight = 1080;

    let width = maxWidth;
    let height = maxHeight;

    if (originalWidth > maxWidth || originalHeight > maxHeight) {
        const aspectRatio = originalWidth / originalHeight;
        if (originalWidth > originalHeight) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
        } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
        }
    }

    let image = sharp(buffer).rotate().resize(width, height, { fit: 'inside' }).withMetadata({ orientation: 1 });

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
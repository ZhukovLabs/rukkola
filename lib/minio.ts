import * as Minio from 'minio'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
const MINIO_PORT = process.env.MINIO_PORT
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'

if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    throw new Error('MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY must be set in environment variables')
}

const port = MINIO_PORT ? parseInt(MINIO_PORT, 10) : 9000

export const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: port,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    useSSL: MINIO_USE_SSL,
})

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'rukkola'

export const ensureBucket = async (): Promise<void> => {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
        await minioClient.makeBucket(BUCKET_NAME)
        await minioClient.setBucketPolicy(
            BUCKET_NAME,
            JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                    },
                ],
            })
        )
    }
}

export const uploadFile = async (
    objectName: string,
    buffer: Buffer,
    contentType: string = 'image/webp'
): Promise<string> => {
    await ensureBucket()
    await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
        'Content-Type': contentType,
    })
    return objectName
}

export const getFile = async (objectName: string): Promise<Buffer | null> => {
    try {
        const stream = await minioClient.getObject(BUCKET_NAME, objectName)
        const chunks: Buffer[] = []
        for await (const chunk of stream) {
            chunks.push(chunk)
        }
        return Buffer.concat(chunks)
    } catch {
        return null
    }
}

export const deleteFile = async (objectName: string): Promise<void> => {
    try {
        await minioClient.removeObject(BUCKET_NAME, objectName)
    } catch {
        // Ignore if file doesn't exist
    }
}
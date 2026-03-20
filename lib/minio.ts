import * as Minio from 'minio'

const getMinioConfig = () => ({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    useSSL: process.env.MINIO_USE_SSL === 'true',
})

console.log('[MinIO] Initializing client with config:', {
    endPoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT,
    useSSL: process.env.MINIO_USE_SSL,
    bucket: process.env.MINIO_BUCKET,
})

const config = getMinioConfig()

export const minioClient = new Minio.Client({
    endPoint: config.endPoint,
    port: config.port,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    useSSL: config.useSSL,
})

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'rukkola'

export const ensureBucket = async (): Promise<void> => {
    console.log('[MinIO] Checking bucket existence:', BUCKET_NAME)
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME)
        console.log('[MinIO] Bucket exists:', exists)
        if (!exists) {
            console.log('[MinIO] Creating bucket:', BUCKET_NAME)
            await minioClient.makeBucket(BUCKET_NAME)
            console.log('[MinIO] Setting bucket policy...')
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
            console.log('[MinIO] Bucket created and configured')
        }
    } catch (error) {
        console.error('[MinIO] ensureBucket error:', error)
        throw error
    }
}

export const uploadFile = async (
    objectName: string,
    buffer: Buffer,
    contentType: string = 'image/webp'
): Promise<string> => {
    console.log('[MinIO] Starting upload:', objectName, 'size:', buffer.length)
    await ensureBucket()
    console.log('[MinIO] Bucket ready, uploading...')
    try {
        await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
            'Content-Type': contentType,
        })
        console.log('[MinIO] Upload successful:', objectName)
        return objectName
    } catch (error) {
        console.error('[MinIO] Upload error:', error)
        throw error
    }
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
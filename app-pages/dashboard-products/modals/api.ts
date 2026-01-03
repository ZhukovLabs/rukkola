export const uploadImageToApi = async (productId: string, file: File) => {
    const formData = new FormData()
    formData.append('id', productId)
    formData.append('file', file)
    const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
    })
    if (!res.ok) {
        const err: { error?: string } = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to upload image')
    }
}
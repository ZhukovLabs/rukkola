const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

function transliterate(str: string) {
    return str
        .toLowerCase()
        .split('')
        .map(char => cyrillicMap[char] ?? char)
        .join('');
}

export function sanitizeFileName(name: string, ext: string) {
    const transliterated = transliterate(name)
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '');

    const timestamp = Date.now();
    return `${transliterated}-${timestamp}${ext}`;
}
// Ecommerce tracking utility for Yandex.Metrica via dataLayer
// https://yandex.ru/support/metrica/data/e-commerce.html

// Initialize dataLayer
if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
}

export interface EcommerceProduct {
    id: string;
    name: string;
    price: number;
    category?: string;
    quantity?: number;
    brand?: string;
    variant?: string;
    list?: string;
    position?: number;
}

export interface PromoFieldObject {
    id: string;
    name?: string;
    creative?: string;
    creative_slot?: string;
    position?: string;
}

// Action type mapping: our event name -> Yandex action type
const ACTION_TYPE_MAP: Record<string, string> = {
    'view_item': 'detail',
    'add_to_cart': 'add',
    'remove_from_cart': 'remove',
    'purchase': 'purchase',
    'impressions': 'impressions',
    'click': 'click',
};

function isValidProduct(product: Partial<EcommerceProduct>): product is EcommerceProduct {
    return !!(
        product.id &&
        product.name &&
        typeof product.price === 'number' &&
        !isNaN(product.price)
    );
}

function sanitizeProduct(product: Partial<EcommerceProduct>): EcommerceProduct | null {
    if (!isValidProduct(product)) return null;

    const sanitized: EcommerceProduct = {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price),
    };

    if (product.category) sanitized.category = String(product.category);
    if (product.quantity !== undefined) sanitized.quantity = Math.max(1, Math.floor(Number(product.quantity) || 1));
    if (product.brand) sanitized.brand = String(product.brand);
    if (product.variant) sanitized.variant = String(product.variant);
    if (product.list) sanitized.list = String(product.list);
    if (product.position !== undefined) sanitized.position = Math.floor(Number(product.position));

    return sanitized;
}

function sanitizeProducts(products: Partial<EcommerceProduct>[]): EcommerceProduct[] {
    return products
        .map(sanitizeProduct)
        .filter((p): p is EcommerceProduct => p !== null);
}

export function trackEcommerceEvent(
    eventName: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'impressions' | 'click',
    payload: {
        items?: Partial<EcommerceProduct>[];
        transaction_id?: string;
        value?: number;
        currency?: string;
    }
): void {
    if (typeof window === 'undefined') return;

    const dataLayer = window.dataLayer = window.dataLayer || [];
    const actionType = ACTION_TYPE_MAP[eventName];

    if (!actionType) {
        console.warn(`[Ecommerce] Unknown action type: ${eventName}`);
        return;
    }

    const ecommerce: any = {
        currencyCode: payload.currency || 'BYN',
    };

    if (eventName === 'purchase') {
        const products = sanitizeProducts(payload.items || []);
        ecommerce[actionType] = {
            actionField: {
                id: String(payload.transaction_id || `order_${Date.now()}`),
                revenue: Number(payload.value) || products.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0),
            },
            products,
        };
    } else if (eventName === 'impressions') {
        const products = sanitizeProducts(payload.items || []);
        if (products.length === 0) return;
        ecommerce[actionType] = products;
    } else {
        const products = sanitizeProducts(payload.items || []);
        if (products.length === 0) return;
        ecommerce[actionType] = {
            products,
        };
    }

    dataLayer.push({ ecommerce });
}

export function trackViewItem(product: Partial<EcommerceProduct>): void {
    trackEcommerceEvent('view_item', { items: [product] });
}

export function trackAddToCart(product: Partial<EcommerceProduct> & { quantity?: number }): void {
    trackEcommerceEvent('add_to_cart', {
        items: [{ ...product, quantity: product.quantity || 1 }]
    });
}

export function trackRemoveFromCart(product: Partial<EcommerceProduct> & { quantity?: number }): void {
    trackEcommerceEvent('remove_from_cart', {
        items: [{ ...product, quantity: product.quantity || 1 }]
    });
}

export function trackPurchase(params: {
    transaction_id?: string;
    items: (Partial<EcommerceProduct> & { quantity?: number })[];
    value?: number;
}): void {
    const items = params.items.map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));

    const value = params.value || items.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * (item.quantity || 1);
    }, 0);

    trackEcommerceEvent('purchase', {
        transaction_id: params.transaction_id,
        items,
        value,
    });
}

export function trackImpressions(products: Partial<EcommerceProduct>[]): void {
    trackEcommerceEvent('impressions', { items: products });
}

export function trackClick(product: Partial<EcommerceProduct>): void {
    trackEcommerceEvent('click', { items: [product] });
}

export function trackPromoView(promos: PromoFieldObject[]): void {
    if (typeof window === 'undefined') return;
    const dataLayer = window.dataLayer = window.dataLayer || [];
    dataLayer.push({
        ecommerce: {
            currencyCode: 'BYN',
            promoView: { promotions: promos },
        }
    });
}

export function trackPromoClick(promos: PromoFieldObject[]): void {
    if (typeof window === 'undefined') return;
    const dataLayer = window.dataLayer = window.dataLayer || [];
    dataLayer.push({
        ecommerce: {
            currencyCode: 'BYN',
            promoClick: { promotions: promos },
        }
    });
}

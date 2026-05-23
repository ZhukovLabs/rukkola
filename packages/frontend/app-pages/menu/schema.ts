const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

type SchemaProduct = {
    name: string;
    description: string | null;
    image: string | null;
    prices: Array<{ size: string; price: number }>;
};

function makeImage(url: string | null): string | undefined {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function makeOffer(price: { size: string; price: number }) {
    return {
        "@type": "Offer",
        "price": price.price,
        "priceCurrency": "BYN",
        "description": price.size,
        "availability": "https://schema.org/InStock",
    };
}

function menuItem(p: SchemaProduct) {
    return {
        "@type": "MenuItem",
        "name": p.name,
        "description": p.description || p.name,
        "image": makeImage(p.image),
        "suitableForDiet": p.description?.toLowerCase().includes("веган")
            ? "https://schema.org/VegetarianDiet"
            : undefined,
        "offers": p.prices.map(makeOffer),
    };
}

function productSchema(p: SchemaProduct) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "description": p.description || p.name,
        "image": makeImage(p.image),
        "offers": p.prices.map(makeOffer),
    };
}

type Group = {
    categoryName: string;
    directProducts: SchemaProduct[];
    subgroups: Array<{
        name: string;
        showGroupTitle: boolean;
        products: SchemaProduct[];
    }>;
};

export function generateMenuSchema(groups: Group[]) {
    return {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Меню кафе Руккола",
        "mainEntityOfPage": BASE_URL,
        "inLanguage": "ru",
        "hasMenuSection": groups.map((group) => ({
            "@type": "MenuSection",
            "name": group.categoryName,
            "hasMenuItem": [
                ...group.directProducts.map(menuItem),
                ...group.subgroups.flatMap((sub) => sub.products.map(menuItem)),
            ],
        })),
    };
}

export function generateProductSchemas(groups: Group[]) {
    return groups
        .flatMap((group) => [
            ...group.directProducts.map(productSchema),
            ...group.subgroups.flatMap((sub) => sub.products.map(productSchema)),
        ])
        .filter((s) => s.image);
}

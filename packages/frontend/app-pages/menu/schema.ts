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

export function parseWorkHours(hours: string): { opens: string; closes: string } {
    const match = hours.match(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/);
    if (!match) return { opens: "12:00", closes: "23:00" };
    return {
        opens: match[1].padStart(5, "0"),
        closes: match[2].padStart(5, "0"),
    };
}

type RestaurantSettings = {
    address: string;
    addressLink: string;
    addressNote: string;
    phone: string;
    phoneLink: string;
    workHours: string;
};

export function generateRestaurantSchema(settings: RestaurantSettings) {
    const hours = parseWorkHours(settings.workHours);
    const cleanPhone = settings.phoneLink.replace(/^tel:/, "");
    const addressPart = settings.addressNote ? ` ${settings.addressNote}` : "";
    return {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": `${BASE_URL}/#restaurant`,
        name: "Руккола",
        url: BASE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo.svg`,
            width: "400",
            height: "200",
        },
        image: {
            "@type": "ImageObject",
            url: `${BASE_URL}/og-image.webp`,
            width: "1200",
            height: "630",
        },
        description:
            `Уютное кафе Руккола в центре Гомеля. Авторская пицца на тонком тесте, свежие суши и роллы, блюда паназиатской кухни. Ежедневные ланчи и завтраки. Тел: ${settings.phone}`,
        telephone: cleanPhone,
        priceRange: "10-45 BYN",
        servesCuisine: [
            "Итальянская",
            "Японская",
            "Паназиатская",
            "Пицца",
            "Суши",
            "Европейская",
        ],
        address: {
            "@type": "PostalAddress",
            streetAddress: `${settings.address}${addressPart}`,
            addressLocality: "Гомель",
            addressRegion: "Гомельская область",
            postalCode: "246000",
            addressCountry: "BY",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 52.4393223,
            longitude: 31.0029487,
        },
        hasMap: settings.addressLink,
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ],
                opens: hours.opens,
                closes: hours.closes,
            },
        ],
        acceptsReservations: "true",
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "347",
            bestRating: "5",
            worstRating: "1",
        },
        paymentAccepted: ["Наличные", "Банковская карта"],
        currenciesAccepted: "BYN",
        potentialAction: {
            "@type": "OrderAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE_URL}/`,
                inLanguage: "ru",
                actionPlatform: [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform",
                ],
            },
            deliveryMethod: ["http://purl.org/goodrelations/v1#Pickup"],
        },
        areaServed: {
            "@type": "City",
            name: "Гомель",
        },
        sameAs: ["https://www.instagram.com/rukkola.gomel"],
        hasMenu: `${BASE_URL}/`,
    };
}

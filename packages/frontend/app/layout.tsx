import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {Providers} from "@/components/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "cyrillic"],
    display: "swap",
    preload: true,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "cyrillic"],
    display: "swap",
    preload: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||"https://rukkola-production.up.railway.app";

const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Руккола",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    image: `${BASE_URL}/og-image.webp`,
    description: "Кафе Руккола в центре Гомеля — авторская пицца, свежие суши, роллы и блюда паназиатской кухни.",
    telephone: "+375447703003",
    priceRange: "$$",
    servesCuisine: ["Итальянская кухня", "Японская кухня", "Паназиатская кухня", "Пицца", "Суши", "Роллы"],
    hasMenu: {
        "@type": "Menu",
        name: "Меню кафе Руккола",
        description: "Авторская пицца, японские суши, роллы, паназиатские блюда"
    },
    address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Советская, 60",
        addressLocality: "Гомель",
        addressRegion: "Гомельская область",
        postalCode: "246000",
        addressCountry: "BY"
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 52.4393223,
        longitude: 31.0029487
    },
    openingHoursSpecification: [
        {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "12:00",
            closes: "23:00"
        }
    ],
    acceptsReservations: "True",
    hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Меню",
        itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "MenuSection", name: "Пицца" } },
            { "@type": "Offer", itemOffered: { "@type": "MenuSection", name: "Суши и роллы" } },
            { "@type": "Offer", itemOffered: { "@type": "MenuSection", name: "Паназиатская кухня" } }
        ]
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "347"
    },
    amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: "True" },
        { "@type": "LocationFeatureSpecification", name: "Parking", value: "True" }
    ],
    sameAs: [
        "https://www.instagram.com/rukkola.gomel",
        "https://vk.com/rukkola_gomel"
    ],
    founder: {
        "@type": "Organization",
        name: "Кафе Руккола"
    },
    areaServed: {
        "@type": "City",
        name: "Гомель"
    }
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: BASE_URL
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Меню",
            item: BASE_URL
        }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Доставка еды из кафе Руккола?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Кафе Руккола работает только на самовывоз. Приходите к нам в гости!"
            }
        },
        {
            "@type": "Question",
            name: "Время работы кафе Руккола?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Мы работаем ежедневно с 12:00 до 23:00 без выходных."
            }
        },
        {
            "@type": "Question",
            name: "Можно ли забронировать столик?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Да, вы можете позвонить нам по номеру +375 (44) 770-30-03 для бронирования столика."
            }
        },
        {
            "@type": "Question",
            name: "Какую кухню предлагает кафе Руккола?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Кафе Руккола предлагает авторскую пиццу, японские суши и роллы, а также блюда паназиатской кухни."
            }
        }
    ]
};

const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: "Руккола — кафе в Гомеле",
    image: `${BASE_URL}/og-image.webp`,
    url: BASE_URL,
    telephone: "+375447703003",
    address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Советская, 60",
        addressLocality: "Гомель",
        addressRegion: "Гомельская область",
        postalCode: "246000",
        addressCountry: "BY"
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 52.4393223,
        longitude: 31.0029487
    },
    openingHours: ["Mo-Su 12:00-23:00"],
    priceRange: "$$",
    servesCuisine: ["Итальянская", "Японская", "Паназиатская"]
};

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Кафе Руккола",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    sameAs: [
        "https://www.instagram.com/rukkola.gomel",
        "https://vk.com/rukkola_gomel"
    ],
    contactPoint: {
        "@type": "ContactPoint",
        telephone: "+375447703003",
        contactType: "customer service",
        availableLanguage: ["Russian", "Belarusian"]
    }
};

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Руккола — кафе с авторской пиццей и суши в Гомеле | Меню и цены",
        template: "%s | Руккола Гомель",
    },
    description: "Кафе Руккола в центре Гомеля: свежая авторская пицца, японские суши и роллы, паназиатская кухня. Меню с ценами. Уютная атмосфера. Ежедневно 12:00-23:00. ул. Советская, 60.",
    
    keywords: [
        "руккола гомель",
        "кафе руккола гомель",
        "пицца гомель",
        "пицца в гомеле",
        "суши гомель",
        "суши в гомеле",
        "роллы гомель",
        "паназиатская кухня гомель",
        "кафе на советской гомель",
        "кафе в центре гомеля",
        "где поесть в гомеле",
        "лучшая пицца гомель",
        "лучшие суши гомель",
        "заказать пиццу гомель",
        "заказать суши гомель",
        "авторская пицца",
        "японская кухня гомель",
        "пхеньянская кухня гомель",
        "корейская кухня гомель",
        "кафе гомель",
        "ресторан гомель",
        "ужин в гомеле",
        "обед в гомеле",
        "вкусная пицца",
        "свежие суши",
    ],

    authors: [{ name: "Руккола" }],
    creator: "Руккола",
    publisher: "Руккола",
    
    alternates: {
        canonical: BASE_URL,
        languages: {
            "ru-BY": BASE_URL,
            "ru": BASE_URL,
            "en": `${BASE_URL}/en`,
        },
    },

    openGraph: {
        type: "website",
        locale: "ru_BY",
        alternateLocale: ["ru"],
        url: BASE_URL,
        siteName: "Кафе Руккола в Гомеле",
        title: "Руккола — авторская пицца и свежие суши в Гомеле",
        description: "Уютное кафе в центре Гомеля. Свежая авторская пицца, японские суши, роллы и блюда паназиатской кухни. Меню с актуальными ценами. Работаем ежедневно 12:00-23:00.",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Кафе Руккола — пицца и суши в Гомеле",
                type: "image/webp",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Руккола — кафе с пиццей и суши в Гомеле",
        description: "Авторская пицца, свежие суши и роллы в уютном кафе в центре Гомеля. Ежедневно 12:00-23:00",
        images: ["/og-image.webp"],
        site: "@rukkola_gomel",
        creator: "@rukkola_gomel",
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    verification: {
        google: "XHWnek4KF6QdZm1UFnJeFW8xUtW1ZXbZkIHO84ZD5xs",
        yandex: "91fc20500288b2fe",
    },

    category: "Restaurant",
    applicationName: "Руккола",
    generator: "Next.js",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
        { color: "#000000" }
    ],
    colorScheme: "dark light",
};

export default function RootLayout({
                                        children,
                                    }: Readonly<{
    children: React.ReactNode;
}>) {
    const schemas = [restaurantSchema, breadcrumbSchema, faqSchema, localBusinessSchema, organizationSchema];
    
    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            
            <meta name="geo.region" content="BY-GO" />
            <meta name="geo.placename" content="Гомель" />
            <meta name="geo.position" content="52.4393223;31.0029487" />
            <meta name="ICBM" content="52.4393223, 31.0029487" />
            
            <meta name="yandex-verification" content="91fc20500288b2fe" />
            <meta name="google-site-verification" content="XHWnek4KF6QdZm1UFnJeFW8xUtW1ZXbZkIHO84ZD5xs" />
            
            <meta name="business:contact_data:locality" content="Гомель" />
            <meta name="business:contact_data:region" content="Гомельская область" />
            <meta name="business:contact_data:country_name" content="Беларусь" />
            <meta name="business:contact_data:postal_code" content="246000" />
            
            <meta name="contact" content="tel:+375447703003" />
            <meta name="telephone" content="+375447703003" />
            <meta name="format-detection" content="telephone=no" />
            
            <meta property="og:phone_number" content="+375447703003" />
            <meta property="og:locale" content="ru_BY" />
            <meta property="og:locale:alternate" content="ru" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Кафе Руккола в Гомеле" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/webp" />
            <meta property="og:image:alt" content="Кафе Руккола — пицца и суши в Гомеле" />
            
            <meta name="twitter:domain" content="rukkola-production.up.railway.app" />
            <meta name="twitter:url" content={BASE_URL} />
            <meta property="twitter:image:width" content="1200" />
            <meta property="twitter:image:height" content="630" />
            
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Руккола" />
            
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="application-name" content="Руккола" />
            
            <meta httpEquiv="strict-transport-security" content="max-age=31536000; includeSubDomains; preload" />
            <meta name="referrer" content="strict-origin-when-cross-origin" />
            
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="manifest" href="/site.webmanifest" />
            
            <link rel="alternate" type="application/rss+xml" title="Руккола RSS" href="/rss.xml" />
            
            <link rel="canonical" href={BASE_URL} />
            <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://mc.yandex.ru" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preload" as="image" href="/og-image.webp" />
            
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <Script
                id="ym-tag"
                src="https://mc.yandex.ru/metrika/tag.js?id=106114023"
                strategy="lazyOnload"
            />
            <Script
                id="ym-init"
                dangerouslySetInnerHTML={{
                    __html: `
                    window.addEventListener('load', function() {
                        if (window.ym) {
                            ym(106114023, 'init', {
                                clickmap: true,
                                ecommerce: "dataLayer",
                                accurateTrackBounce: false,
                                trackLinks: true,
                                params: {}
                            });
                        }
                    }, { once: true });
                    `,
                }}
            />
            <noscript>
                <div>
                    <img
                        src="https://mc.yandex.ru/watch/106114023"
                        style={{position: 'absolute', left: '-9999px'}}
                        alt=""
                    />
                </div>
            </noscript>

        </head>

        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}

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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-production.up.railway.app";

const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment"],
    "@id": `${BASE_URL}/#restaurant`,
    name: "Руккола",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    image: `${BASE_URL}/og-image.webp`,
    description: "Кафе Руккола в центре Гомеля на Советской 60. Авторская пицца, свежие суши, роллы и блюда паназиатской кухни. Актуальное меню с ценами, фотографии блюд, завтраки и ланчи.",
    telephone: "+375447703003",
    priceRange: "$$",
    servesCuisine: ["Итальянская кухня", "Японская кухня", "Паназиатская кухня", "Пицца", "Суши", "Роллы", "Завтраки", "Обеды"],
    hasMenu: {
        "@type": "Menu",
        name: "Меню кафе Руккола",
        description: "Полное меню кафе Руккола с актуальными ценами: пицца, суши, роллы, паназиатские блюда.",
        url: `${BASE_URL}/`
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
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "347"
    },
    paymentAccepted: ["Cash", "Credit Card"],
    currenciesAccepted: "BYN",
    sameAs: [
        "https://www.instagram.com/rukkola.gomel",
        "https://vk.com/rukkola_gomel"
    ]
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
            name: "Меню и цены",
            item: `${BASE_URL}/#menu`
        }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Где находится кафе Руккола в Гомеле?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Кафе Руккола расположено в самом центре Гомеля по адресу: ул. Советская, 60 (возле ГГУ им. Ф. Скорины). Вы всегда можете найти нас по яркой вывеске на главной улице города."
            }
        },
        {
            "@type": "Question",
            name: "Какое меню и цены в Рукколе на Советской?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "В нашем меню представлена авторская пицца от 15 BYN, свежие суши и роллы, а также блюда паназиатской кухни. Полное актуальное меню с ценами и фото доступно на нашем сайте."
            }
        },
        {
            "@type": "Question",
            name: "Есть ли доставка еды из кафе Руккола?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "На данный момент мы работаем в формате кафе и навынос (самовывоз). Вы можете оформить заказ по телефону +375 (44) 770-30-03 и забрать его самостоятельно в удобное время."
            }
        },
        {
            "@type": "Question",
            name: "Есть ли в Рукколе завтраки и обеденное меню?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Да! Мы предлагаем сытные завтраки и разнообразное обеденное меню (ланчи) по будням. Приходите к нам на вкусный и быстрый обед в центре Гомеля."
            }
        }
    ]
};

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Руккола Гомель — Меню и цены | Кафе на Советской 60",
        template: "%s | Руккола Гомель",
    },
    description: "Кафе Руккола в Гомеле на Советской 60: актуальное меню с ценами на пиццу и суши. Завтраки, ланчи, паназиатская кухня. Уютная атмосфера и фото блюд. Звоните: +375(44)770-30-03.",
    
    keywords: [
        "руккола гомель",
        "рукола гомель",
        "руккола гомель меню",
        "руккола гомель меню цены",
        "руккола гомель телефон",
        "кафе руккола гомель",
        "пицца гомель",
        "суши гомель",
        "роллы гомель",
        "обеденное меню гомель",
        "ланчи гомель",
        "завтраки гомель",
        "советская 60 гомель кафе",
        "суши бар руккола",
        "rukkola гомель",
        "кафе на советской гомель",
    ],

    authors: [{ name: "Руккола" }],
    creator: "Руккола",
    publisher: "Руккола",
    
    alternates: {
        canonical: "/",
        languages: {
            "ru-BY": "/",
        },
    },

    openGraph: {
        type: "website",
        locale: "ru_BY",
        url: BASE_URL,
        siteName: "Кафе Руккола в Гомеле",
        title: "Руккола Гомель — Авторская пицца и свежие суши",
        description: "Посмотрите наше актуальное меню с ценами и фото. Ждем вас на Советской 60 в Гомеле. Пицца, суши, роллы, ланчи и завтраки.",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Кафе Руккола в Гомеле — Меню и цены",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Руккола Гомель | Меню и цены кафе на Советской",
        description: "Авторская пицца, суши и роллы в центре Гомеля. Ежедневно 12:00-23:00",
        images: ["/og-image.webp"],
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
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export default function RootLayout({
                                        children,
                                    }: Readonly<{
    children: React.ReactNode;
}>) {
    const schemas = [restaurantSchema, breadcrumbSchema, faqSchema];
    
    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            {/* Geo Tags */}
            <meta name="geo.region" content="BY-GO" />
            <meta name="geo.placename" content="Гомель" />
            <meta name="geo.position" content="52.4393223;31.0029487" />
            <meta name="ICBM" content="52.4393223, 31.0029487" />
            
            <meta name="format-detection" content="telephone=yes" />

            {/* Apple Specific */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            
            {/* Favicons and Manifest */}
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="manifest" href="/site.webmanifest" />
            
            <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://mc.yandex.ru" />
            
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
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();
                        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                        ym(106114023, "init", {
                                clickmap:true,
                                trackLinks:true,
                                accurateTrackBounce:true,
                                webvisor:true,
                                ecommerce:"dataLayer"
                        });
                    `,
                }}
            />
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}

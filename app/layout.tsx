import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://rukkola-production.up.railway.app"),

    title: {
        default: "Руккола — кафе с авторской пиццей и суши в Гомеле",
        template: "%s | Руккола — кафе в Гомеле",
    },

    description:
        "Кафе Руккола в центре Гомеля: свежая авторская пицца, японские суши и роллы, паназиатская кухня. Уютная атмосфера, ежедневно с 12:00 до 23:00. Ул. Советская, 60. +375 (44) 770-30-03",

    keywords: [
        // Бренд + гео
        "руккола гомель",
        "кафе руккола гомель",
        "руккола гомель кафе",
        "ресторан руккола гомель",
        "заведение руккола",

        //  Основное меню + гео
        "пицца гомель",
        "пинца в гомеле",
        "суши гомель свежие",
        "суши в гомеле",
        "роллы гомель",
        "паназиатская кухня гомель",
        "азиатская кухня гомель",
        "японская кухня гомель",

        // Локационные запросы
        "кафе на советской гомель",
        "кафе в центре гомеля",
        "где поесть в гомеле",
        "рестораны гомеля центр",
        "заведения гомеля центр",

        // Коммерческие запросы без доставки
        "где поесть пиццу гомель",
        "где поесть пинцу гомель",
        "где поесть суши гомель",
        "где поесть роллы гомель",
        "лучшая пицца гомель",
        "лучшая пинца гомель",
        "лучшие суши гомель",
        "кафе с суши гомель",
        "кафе с пиццей гомель",
        "кафе с пинцей гомель",
        "где поесть паназиатскую кухню в Гомеле",
        "лучшее кафе с роллами в центре Гомеля",
        "пинца и суши рядом со мной Гомель",

        // Тип заведения + локация
        "кафе гомель",
        "кафе центр гомель",
        "ресторан гомель",
        "кафе на советской гомель",
        "заведения гомеля",
    ],

    alternates: {
        canonical: "https://rukkola-production.up.railway.app",
    },

    openGraph: {
        title: "Руккола — авторская пицца и свежие суши в Гомеле | Кафе в центре",
        description:
            "Уютное кафе в центре Гомеля на ул. Советской, 60. Авторская пицца, японские суши, паназиатская кухня. Работаем ежедневно 12:00-23:00",
        url: "https://rukkola-production.up.railway.app",
        siteName: "Кафе Руккола в Гомеле",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Руккола — кафе с пиццей и суши в Гомеле",
            },
        ],
        locale: "ru_BY",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Руккола — кафе с пиццей и суши в Гомеле",
        description: "Авторская пинца, свежие суши и роллы в уютном кафе в центре Гомеля. Приходите в Рукколу!",
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
        // @ts-expect-error - ok
        yandexBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
        }
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#000000",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <meta name="google-site-verification" content="XHWnek4KF6QdZm1UFnJeFW8xUtW1ZXbZkIHO84ZD5xs"/>
            <meta name="yandex-verification" content="91fc20500288b2fe"/>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Restaurant",
                        name: "Руккола",
                        url: "https://rukkola-production.up.railway.app",
                        logo: "https://rukkola-production.up.railway.app/logo.svg",
                        image: "https://rukkola-production.up.railway.app/og-image.webp",
                        description: "Кафе Руккола в центре Гомеля — авторская пинца, свежие суши, роллы и блюда паназиатской кухни.",
                        telephone: "+375447703003",
                        priceRange: "$$",
                        address: {
                            "@type": "PostalAddress",
                            streetAddress: "ул. Советская, 60",
                            addressLocality: "Гомель",
                            addressRegion: "Гомельская область",
                            addressCountry: "BY",
                        },
                        geo: {
                            "@type": "GeoCoordinates",
                            latitude: 52.441176,
                            longitude: 30.987846,
                        },
                        openingHoursSpecification: {
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
                            opens: "12:00",
                            closes: "23:00",
                        },
                        servesCuisine: ["Пинца", "Пицца", "Суши", "Роллы", "Японская кухня", "Паназиатская кухня"],
                        acceptsReservations: true,
                        sameAs: [
                            "https://www.instagram.com/rukkola.gomel"
                        ],
                    }),
                }}
            />
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
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
        "Руккола — уютное кафе в центре Гомеля. Авторская пинца, свежие суши, роллы и блюда паназиатской кухни. Работаем ежедневно с 12:00 до 23:00.",

    keywords: [
        // Бренд
        "руккола",
        "руккола гомель",
        "кафе руккола",
        "кафе руккола гомель",

        // Основные блюда + гео
        "пицца гомель",
        "пинца гомель",
        "суши гомель",
        "роллы гомель",
        "японская кухня гомель",
        "паназиатская кухня гомель",
        "азиатская кухня гомель",

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
        title: "Руккола — кафе с пиццей и суши в Гомеле",
        description:
            "Уютное кафе Руккола в центре Гомеля: авторская пинца, свежие суши и роллы, паназиатская кухня. Ждём вас ежедневно с 12:00 до 23:00.",
        url: "https://rukkola-production.up.railway.app",
        siteName: "Руккола",
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
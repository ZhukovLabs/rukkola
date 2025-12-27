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
    title: {
        default: "Руккола — пицца, суши, роллы в Гомеле",
        template: "%s | Руккола — пицца и суши в [город]",
    },
    description:
        "Руккола — уютное кафе с авторской пиццей, свежими суши и роллами, пад тай и другими блюдами азиатской кухни. Работает с 12:00 до 23:00.",
    keywords: [
        "руккола",
        "пицца",
        "суши",
        "роллы",
        "пад тай",
        "азиатская кухня",
        "паназиатская кухня",
        "кафе руккола",
        "пицца",
        "суши",
        "Гомель",
    ],

    alternates: {
        canonical: "https://rukkola-production.up.railway.app",
    },

    openGraph: {
        title: "Руккола — пицца и суши в Гомеле",
        description:
            "Свежая пицца, вкусные суши и роллы. Приходи и насладись едой!",
        url: "https://rukkola-production.up.railway.app",
        siteName: "Руккола",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Руккола — пицца и суши",
            },
        ],
        locale: "ru_RU",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Руккола — пицца и суши",
        description: "Закажи пиццу, суши и роллы с доставкой",
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
            <meta name="google-site-verification" content="XHWnek4KF6QdZm1UFnJeFW8xUtW1ZXbZkIHO84ZD5xs" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Restaurant",
                        name: "Руккола",
                        description:
                            "Кафе Руккола — авторская пицца, суши, роллы и блюда азиатской кухни с доставкой.",
                        url: "https://rukkola.rest",
                        logo: "https://rukkola.rest/logo.svg",
                        image: "https://rukkola.rest/og-image.jpg",
                        telephone: "+375 (44) 770-30-03",
                        address: {
                            "@type": "PostalAddress",
                            streetAddress: "ул. Советская, 60",
                            addressLocality: "Гомель",
                            addressCountry: "RU",
                        },
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
                                opens: "12:00",
                                closes: "23:00",
                            },
                        ],
                        servesCuisine: ["Японская", "Азиатская"],
                        priceRange: "$$",
                        hasMenu: "https://rukkola-production.up.railway.app",
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
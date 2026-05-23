import type {Metadata, Viewport} from "next";
import Script from "next/script";
import {Geist, Geist_Mono} from "next/font/google";
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

const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

const restaurantSchema = {
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
        "Уютное кафе Руккола в центре Гомеля. Авторская пицца на тонком тесте, свежие суши и роллы, блюда паназиатской кухни. Ежедневные ланчи и завтраки на Советской 60.",
    telephone: "+375447703003",
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
        streetAddress: "ул. Советская, 60",
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
    hasMap: "https://www.google.com/maps?cid=10915677044161894942",
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
            opens: "11:00",
            closes: "23:00",
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

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Руккола Гомель — Кафе на Советской | Меню, Пицца и Суши",
        template: "%s | Руккола Гомель",
    },
    description:
        "Ищете где поесть в Гомеле? Кафе Руккола (Советская 60): авторская пицца, свежие суши, роллы и WOK. Ежедневные ланчи и завтраки. Бронируйте столик: +375 (44) 770-30-03.",
    keywords: [
        "кафе гомель",
        "пицца гомель",
        "суши гомель",
        "руккола гомель",
        "где поесть гомель",
        "ланч гомель",
        "завтрак гомель",
        "советская 60 гомель",
    ],
    authors: [{name: "Руккола"}],
    creator: "Руккола",
    publisher: "Руккола",
    alternates: {
        canonical: "/",
        languages: {
            "ru-BY": "/",
        },
    },
    icons: {
        icon: [
            {url: "/favicon.ico"},
            {url: "/favicon-16x16.png", sizes: "16x16", type: "image/png"},
            {url: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
        ],
        apple: [{url: "/apple-icon.png", sizes: "180x180", type: "image/png"}],
    },
    manifest: "/site.webmanifest",
    openGraph: {
        type: "website",
        locale: "ru_BY",
        url: BASE_URL,
        siteName: "Кафе Руккола в Гомеле",
        title: "Руккола Гомель — Авторская пицца и свежие суши",
        description:
            "Актуальное меню с ценами и фото. Ждем вас на Советской 60 в центре Гомеля. Пицца, суши, роллы, ланчи и завтраки.",
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
        description:
            "Авторская пицца, суши и роллы в центре Гомеля. Ежедневно 12:00-23:00",
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
        google: "lYp3G8aIWuG_wRLs3my1z1LJ6SLBb85VeqkpGAZy0bA",
        yandex: "ce52b4f1f6bd4b9e",
    },
    formatDetection: {
        telephone: true,
        address: true,
        email: false,
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Руккола",
    },
    other: {
        "geo.region": "BY-GO",
        "geo.placename": "Гомель",
        "geo.position": "52.4393223;31.0029487",
        ICBM: "52.4393223, 31.0029487",
    },
    category: "Restaurant",
    applicationName: "Руккола",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#0a0a0a"},
        {media: "(prefers-color-scheme: dark)", color: "#0a0a0a"},
    ],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            <link
                rel="preconnect"
                href="https://mc.yandex.ru"
                crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href="https://mc.yandex.ru"/>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(restaurantSchema),
                }}
            />
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>

        <Script id="yandex-metrika" strategy="afterInteractive">
            {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for(var j=0;j<document.scripts.length;j++){
                if(document.scripts[j].src===r){return;}
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=109079283','ym');

            ym(109079283,'init',{
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>

        <noscript>
            <div>
                <img
                    src="https://mc.yandex.ru/watch/109079283"
                    style={{position: "absolute", left: "-9999px"}}
                    alt=""
                />
            </div>
        </noscript>
        </body>
        </html>
    );
}
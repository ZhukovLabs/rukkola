import type {Metadata, Viewport} from "next";
import Script from "next/script";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/providers";
import {BrowserCompatibilityNotice} from "@/components/browser-compatibility-notice";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "cyrillic"],
    display: "optional",
    preload: true,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "cyrillic"],
    display: "optional",
    preload: true,
});

const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Руккола Гомель — Кафе на Советской | Меню, Пицца и Суши",
        template: "%s | Руккола Гомель",
    },
    description:
        "Кафе Руккола Гомель — авторская пицца, пинца, свежие суши и роллы, вок. Вкусные бизнес-ланчи каждый день. Ул. Советская, 60. Приятная атмосфера в центре города. Звоните и бронируйте: +375 (44) 770-30-03",
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
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  try {
    if(typeof localStorage !== 'undefined') {
      try { if(localStorage.getItem('browser-compat-dismissed') === 'true') return; } catch(e) {}
    }
    var hasJS = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal && typeof structuredClone === 'function' && typeof ResizeObserver !== 'undefined' && typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
    var hasCSS = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'grid') && CSS.supports('aspect-ratio', '1/1') && CSS.supports('gap', '0px') && CSS.supports('color', 'var(--x)');
    if(!hasJS || !hasCSS) {
      window.__browserOld = true;
      if(document.body) document.body.style.paddingTop = '54px';
    }
  } catch(e) {}
})();
`}} />
        <BrowserCompatibilityNotice/>
        <noscript>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '12px 20px',
                zIndex: 999999,
                borderBottom: '2px solid #333333',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                lineHeight: '1.4',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <strong>Ваш браузер устарел.</strong> Сайт может работать медленно или отображаться некорректно.
                Пожалуйста, обновите систему или используйте современный браузер (Chrome, Edge) для лучшего опыта.
            </div>
        </noscript>
        <Providers>{children}</Providers>

        <Script id="yandex-metrika" strategy="lazyOnload">
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
              clickmap:true,
              ecommerce:"dataLayer",
              accurateTrackBounce:true,
              trackLinks:true
            });

            var _ym_bfcache = function(){
              if(window.ym) ym(109079283,'init',{trackHash:true});
            };
            window.addEventListener('pageshow',function(e){
              if(e.persisted) setTimeout(_ym_bfcache,0);
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
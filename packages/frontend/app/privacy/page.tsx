import type { Metadata } from "next";
import PrivacyPageClient from "./privacy-page-client";

const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

export const metadata: Metadata = {
    title: "Политика конфиденциальности | Руккола Гомель",
    description:
        "Политика обработки персональных данных и конфиденциальности кафе Руккола в Гомеле. Узнайте, как мы защищаем вашу информацию.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Главная",
                item: BASE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Приватность",
                item: `${BASE_URL}/privacy`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />

            <PrivacyPageClient />
        </>
    );
}
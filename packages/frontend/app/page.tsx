import {MenuPage} from "@/app-pages/menu";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Главная",
            "item": BASE_URL
        }
    ]
};

type HomePageProps = {
    searchParams: Promise<{ token?: unknown }>;
};

const HomePage = async ({searchParams}: HomePageProps) => {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <MenuPage searchParams={searchParams} />
        </>
    );
};

export default HomePage;
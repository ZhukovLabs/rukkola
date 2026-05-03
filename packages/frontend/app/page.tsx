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

const HomePage = async (props: any) => {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <MenuPage {...props} />
        </>
    );
};

export default HomePage;
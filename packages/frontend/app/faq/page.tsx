import type { Metadata } from 'next'
import FAQPageClient from './faq-page-client'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

export const metadata: Metadata = {
    title: 'FAQ — Ответы на вопросы | Кафе Руккола Гомель',
    description: 'Всё о кафе Руккола в Гомеле: меню, цены, заказ навынос, бронь столов и режим работы. Ответы на частые вопросы гостей кафе на Советской 60.',
    alternates: {
        canonical: '/faq',
    },
}

export default function FAQPage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": BASE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "FAQ — Вопросы и ответы",
                "item": `${BASE_URL}/faq`
            }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Где именно находится кафе «Руккола» на Советской?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Кафе «Руккола» расположено по адресу: г. Гомель, ул. Советская, 60. Мы находимся в самом центре города, напротив ГГУ им. Ф. Скорины. Удобное расположение позволяет легко добраться к нам из любой точки Гомеля."
                }
            },
            {
                "@type": "Question",
                "name": "В какие часы работает кафе Руккола в Гомеле?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы ждем гостей ежедневно с 12:00 до 23:00. В это время вы можете насладиться нашими завтраками, ланчами или заказать ужин."
                }
            },
            {
                "@type": "Question",
                "name": "Как заказать пиццу, суши или роллы навынос (самовывоз)?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Для заказа блюд навынос позвоните нам по номеру +375 (44) 770-30-03. Мы приготовим ваш заказ к нужному времени, чтобы вы могли забрать горячую пиццу или свежие суши без ожидания."
                }
            },
            {
                "@type": "Question",
                "name": "Какой номер телефона для бронирования столика?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Забронировать столик в «Рукколе» можно по телефону +375 (44) 770-30-03. Рекомендуем бронировать места заранее, особенно на вечернее время и выходные дни."
                }
            },
            {
                "@type": "Question",
                "name": "Какие кухни представлены в меню кафе?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Наше меню сочетает в себе лучшие традиции итальянской, японской и паназиатской кухни: авторская пицца на тонком тесте, большой выбор суши и роллов, а также блюда WOK."
                }
            },
            {
                "@type": "Question",
                "name": "Есть ли в меню вегетарианские или постные блюда?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, в «Рукколе» большой выбор вегетарианских позиций — от овощной пиццы до роллов без рыбы и мяса. Все такие блюда отмечены специальным символом в меню."
                }
            },
            {
                "@type": "Question",
                "name": "Можно ли провести день рождения или банкет в вашем кафе?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы с радостью поможем организовать ваш праздник! Для обсуждения условий проведения мероприятий, банкетов или дней рождения в центре Гомеля, свяжитесь с нашим администратором по телефону +375 (44) 770-30-03."
                }
            },
            {
                "@type": "Question",
                "name": "Есть ли в кафе специальные предложения на обед (ланчи)?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, по будням мы предлагаем комплексные ланч-меню по выгодным ценам. Меню ланчей обновляется регулярно. Ждем вас на вкусный обед в центре Гомеля!"
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <FAQPageClient />
        </>
    )
}

import type { Metadata } from 'next'
import FAQPageClient from './faq-page-client'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rukkola-gomel.by";

export const metadata: Metadata = {
    title: 'FAQ — Ответы на вопросы гостей | Кафе Руккола Гомель',
    description: 'Всё о кафе Руккола в Гомеле: актуальное меню 2026, цены, заказ навынос и бронь столов. Ответы на частые вопросы гостей нашего кафе на Советской 60.',
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
                "name": "Где находится кафе Руккола в Гомеле?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы находимся в самом центре Гомеля по адресу: ул. Советская, 60 (напротив главного корпуса ГГУ им. Ф. Скорины). Вход со стороны улицы Советской."
                }
            },
            {
                "@type": "Question",
                "name": "В какие часы работает кафе Руккола?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Ждем гостей ежедневно с 12:00 до 23:00. В это время доступно основное меню, а также специальные предложения на завтраки и ланчи."
                }
            },
            {
                "@type": "Question",
                "name": "Можно ли заказать доставку пиццы и суши?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "На данный момент мы работаем на самовывоз (навынос). Вы можете оформить предзаказ по телефону +375 (44) 770-30-03 и забрать его горячим в удобное время."
                }
            },
            {
                "@type": "Question",
                "name": "Какой номер телефона для бронирования столика?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Забронировать столик в «Рукколе» можно по телефону +375 (44) 770-30-03. Рекомендуем бронировать места заранее, особенно в вечернее время и выходные дни."
                }
            },
            {
                "@type": "Question",
                "name": "Есть ли в меню ланчи и обеденное меню?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, ежедневно с 12:00 до 16:00 в Рукколе действует специальное обеденное меню (ланчи). Меню обновляется регулярно, включая супы, горячие блюда и салаты по выгодным ценам."
                }
            },
            {
                "@type": "Question",
                "name": "Какие кухни представлены в меню?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Наше меню — это сочетание итальянской, японской и паназиатской кухни: авторская пицца на тонком тесте, большой выбор суши, роллов и блюд WOK."
                }
            },
            {
                "@type": "Question",
                "name": "Есть ли вегетарианские блюда?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, мы предлагаем широкий выбор вегетарианских позиций — от овощной пиццы до роллов без рыбы и мяса. Все такие блюда отмечены специальным символом в нашем меню."
                }
            },
            {
                "@type": "Question",
                "name": "Можно ли провести день рождения в кафе?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы с радостью поможем организовать ваш праздник! Для обсуждения условий банкетов или дней рождения в центре Гомеля, свяжитесь с нашим администратором по телефону +375 (44) 770-30-03."
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

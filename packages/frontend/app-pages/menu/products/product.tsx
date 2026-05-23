'use client';

import {
    Flex,
    Text,
    Heading,
    Button,
    Stack,
    Box,
    Center,
    Icon,
} from "@chakra-ui/react";
import Image from "next/image";
import {useState} from "react";
import {FiCheck, FiImage} from "react-icons/fi";
import {addToCart} from "@/lib/local-storage";
import {trackAddToCart} from "@/lib/ecommerce-tracking";
import {useProductModal} from "../product-modal/use-product-modal";
import {ProductTags} from "./product-tags";
import type {ProductClientType} from "./types";
import {PriceSelector} from "./price-selector";

const DEFAULT_BLUR_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhSPQAIZwPB9++2WgAAAABJRU5ErkJggg==";

function ProductImage({img, alt, blurDataURL, onError}: {
    img: string;
    alt: string;
    blurDataURL?: string | null;
    onError: () => void;
}) {
    return (
        <Image
            src={img.includes('?') ? `${img}&w=450` : `${img}?w=450`}
            alt={alt}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 60vw, 45vw"
            placeholder="blur"
            blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
            style={{objectFit: "cover", objectPosition: "center"}}
            onError={onError}
            unoptimized
        />
    );
}

export function Product({product}: { product: ProductClientType }) {
    const {open: openProductModal} = useProductModal();
    const {id, name: title, description, image: img, blurDataURL, prices, tags} = product;

    const [added, setAdded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const addItem = (price: number, size: string) => {
        addToCart({id, name: title, image: img ?? "", blurDataURL: blurDataURL ?? undefined, price, size});
        trackAddToCart({id, name: title, price, quantity: 1});
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    return (
        <Flex
            direction={{base: "column", md: "row"}}
            w="100%"
            borderWidth="1px"
            borderRadius={{base: "md", md: "xl"}}
            borderColor="gray.700"
            bg="gray.800"
        >
            <Box
                position="relative"
                w={{base: "100%", md: "45%"}}
                aspectRatio={{base: 3 / 2}}
                flexShrink={0}
                overflow="hidden"
                cursor={img ? "zoom-in" : undefined}
                onClick={() => img && openProductModal(id)}
            >
                {!img || imgError ? (
                    <Center position="absolute" inset={0} bg="gray.700">
                        <Icon as={FiImage} boxSize={6} color="gray.400"/>
                    </Center>
                ) : (
                    <ProductImage img={img} alt={title} blurDataURL={blurDataURL} onError={() => setImgError(true)}/>
                )}
                {tags?.length ? <ProductTags tags={tags}/> : null}
            </Box>

            <Flex direction="column" flex="1" p={{base: 3, md: 6}}>
                <Stack>
                    <Heading fontSize={{base: "md", md: "xl"}} color="whiteAlpha.900">
                        {title}
                    </Heading>
                    {description && (
                        <Text fontSize={{base: "xs", md: "sm"}} color="gray.400" lineClamp={{base: 2, md: 4}}>
                            {description}
                        </Text>
                    )}
                </Stack>

                <Box mt="auto">
                    <PriceSelector prices={prices ?? []} onAdd={addItem} added={added}/>
                </Box>
            </Flex>
        </Flex>
    );
}

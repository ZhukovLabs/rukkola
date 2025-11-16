import { lazy, Suspense } from "react";
import { ProductSkeleton } from "@/app-pages/menu/products/product-skeleton";

export const Product = lazy(() => import("./product-inner"));

export const ProductWithSuspense = (props: React.ComponentProps<typeof Product>) => (
    <Suspense fallback={<ProductSkeleton />}>
        <Product {...props} />
    </Suspense>
);
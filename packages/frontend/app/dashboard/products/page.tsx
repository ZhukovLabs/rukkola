import {Suspense} from "react";
import {ProductsPage} from "@/app-pages/dashboard-products";

export default function DashboardProductsPage() {
    return (
        <Suspense>
            <ProductsPage/>
        </Suspense>
    );
}
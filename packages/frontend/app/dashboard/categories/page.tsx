import {Suspense} from "react";
import {DashboardCategoriesPage} from "@/app-pages/dashboard-categories";

export default function DashboardCategories() {
    return (
        <Suspense>
            <DashboardCategoriesPage/>
        </Suspense>
    );
}
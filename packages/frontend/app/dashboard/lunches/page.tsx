import {Suspense} from "react";
import {LunchDashboardPage} from "@/app-pages/dashboard-lunches";

export default function DashboardLunches() {
    return (
        <Suspense>
            <LunchDashboardPage/>
        </Suspense>
    );
}
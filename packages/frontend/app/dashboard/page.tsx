import {Suspense} from "react";
import {Dashboard} from "@/app-pages/dashboard-main";

export default function DashboardPage() {
    return (
        <Suspense>
            <Dashboard/>
        </Suspense>
    );
}

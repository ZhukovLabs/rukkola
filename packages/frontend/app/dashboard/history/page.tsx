import {Suspense} from "react";
import {DashboardHistoryPage} from "@/app-pages/dashboard-history";

export default function DashboardHistory() {
    return (
        <Suspense>
            <DashboardHistoryPage/>
        </Suspense>
    );
}

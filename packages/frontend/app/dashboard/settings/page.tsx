import {Suspense} from "react";
import {DashboardSettingsPage} from "@/app-pages/dashboard-settings";

export default function DashboardSettings() {
    return (
        <Suspense>
            <DashboardSettingsPage/>
        </Suspense>
    );
}
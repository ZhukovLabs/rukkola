"use client";

import React, {useEffect, useRef} from "react";
import {Box} from "@chakra-ui/react";

interface HCaptchaProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    theme?: "light" | "dark";
}

declare global {
    interface Window {
        hcaptcha?: {
            render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
            reset: (widgetId?: string) => void;
            getResponse: (widgetId?: string) => string;
        };
    }
}

export const HCaptcha: React.FC<HCaptchaProps> = ({
    siteKey,
    onVerify,
    onExpire,
    onError,
    theme = "dark",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        const renderCaptcha = () => {
            if (!window.hcaptcha || !containerRef.current) return;

            try {
                window.hcaptcha.render(containerRef.current, {
                    sitekey: siteKey,
                    theme,
                    callback: onVerify,
                    "expired-callback": onExpire,
                    "error-callback": onError,
                });
            } catch (error) {
                console.error("Error rendering hCaptcha:", error);
            }
        };

        if (window.hcaptcha) {
            renderCaptcha();
        } else {
            const existingScript = document.querySelector('script[src*="hcaptcha.com"]');
            if (existingScript) {
                existingScript.addEventListener("load", renderCaptcha);
            } else {
                const script = document.createElement("script");
                script.src = "https://js.hcaptcha.com/1/api.js";
                script.async = true;
                script.defer = true;
                script.onload = renderCaptcha;
                script.onerror = () => console.error("Failed to load hCaptcha script");
                document.head.appendChild(script);
            }
        }
    }, [siteKey, theme, onVerify, onExpire, onError]);

    if (!siteKey) return null;

    return (
        <Box ref={containerRef} id="hcaptcha-container" display="flex" justifyContent="center" />
    );
};
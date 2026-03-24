import { useState, useSyncExternalStore } from "react";

const getDevicePerformance = () => {
    if (typeof window === "undefined") return false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return true;

    const cores = navigator.hardwareConcurrency ?? 4;
    if (cores <= 2) return true;

    const canvas = document.createElement("canvas");
    const gl =
        (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
        (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
        null;

    if (!gl) return true;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
        ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
        : "";

    const rendererLower = renderer?.toLowerCase() ?? "";

    const weakGpuPatterns = [
        "swiftshader", "mesa", "llvmpipe", 
        "intel hd", "intel(r) hd", "intel(r) uhd",
        "adreno 3", "adreno 4",
        "mali-4", "mali-t6", "mali-t7",
        "powervr"
    ];

    if (weakGpuPatterns.some(pattern => rendererLower.includes(pattern))) {
        return true;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isOldMobile =
        /android [2-6]/.test(ua) ||
        /(iphone|ipad)\s+os\s+([2-9]|1[0-2])/.test(ua) ||
        /redmi\s+(1|2|3|4|5|a[1-5])|mi\s+a1|honor\s+([5-7]|[5-7][a-z])|galaxy\s+[jcs][1-5]/.test(ua);

    return isOldMobile;
};

const reducedMotionSubscribe = (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
};

const getReducedMotion = () => {
    if (typeof window === "undefined") return null;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

let cachedResult: boolean | null = null;

export const useIsLowPerformanceDevice = () => {
    const prefersReducedMotion = useSyncExternalStore(
        reducedMotionSubscribe,
        getReducedMotion,
        () => null
    );

    const [isLowPerformance] = useState(() => {
        if (cachedResult === null) {
            cachedResult = getDevicePerformance();
        }
        return cachedResult;
    });

    if (prefersReducedMotion === true) {
        return true;
    }

    return isLowPerformance;
};

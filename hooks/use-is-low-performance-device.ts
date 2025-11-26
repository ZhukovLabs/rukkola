import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export const useIsLowPerformanceDevice = () => {
    const prefersReducedMotion = useReducedMotion();

    return useMemo(() => {
        if (typeof window === "undefined") {
            // На сервере возвращаем false — motion будет включён
            return false;
        }

        // 1) Системное предпочтение
        if (prefersReducedMotion) return true;

        // 2) CPU
        const cores = navigator.hardwareConcurrency ?? 4;
        if (cores <= 4) return true;

        // 3) GPU performance via WebGL
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

        const isWeakGpu =
            rendererLower.includes("swiftshader") ||
            rendererLower.includes("mesa") ||
            rendererLower.includes("intel") ||
            rendererLower.includes("adreno 3") ||
            rendererLower.includes("mali-4") ||
            rendererLower.includes("mali-t6");

        if (isWeakGpu) return true;

        // 4) Старые мобильные устройства
        const ua = navigator.userAgent.toLowerCase();
        const isOldMobile =
            /android [5-9]|iphone [5-8]/.test(ua) ||
            /redmi|mi a1|honor 7|galaxy j/.test(ua);

        return isOldMobile;
    }, [prefersReducedMotion]);
};

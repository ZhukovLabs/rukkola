import {useEffect, useState} from "react";

/**
 * Hook to detect if the user has requested reduced motion at the OS level.
 */
export const useReducedMotion = (): boolean => {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        // Modern browsers
        mediaQuery.addEventListener("change", handleChange);
        
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return reducedMotion;
};

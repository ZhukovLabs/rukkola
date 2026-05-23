'use client';

import { useEffect, useRef } from "react";

export function useBodyScrollLock(locked: boolean) {
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (!locked) return;

        scrollYRef.current = window.scrollY;
        const body = document.body;
        const html = document.documentElement;

        const prev: Record<string, string> = {};
        const get = (el: HTMLElement, prop: string) => el.style.getPropertyValue(prop);

        prev.bodyOverflow = get(body, "overflow");
        prev.bodyPosition = get(body, "position");
        prev.bodyWidth = get(body, "width");
        prev.bodyTop = get(body, "top");
        prev.htmlScrollBehavior = get(html, "scroll-behavior");
        prev.bodyScrollBehavior = get(body, "scroll-behavior");

        html.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.width = "100%";
        body.style.top = `-${scrollYRef.current}px`;

        return () => {
            body.style.overflow = prev.bodyOverflow;
            body.style.position = prev.bodyPosition;
            body.style.width = prev.bodyWidth;
            body.style.top = prev.bodyTop;
            window.scrollTo(0, scrollYRef.current);
            html.style.scrollBehavior = prev.htmlScrollBehavior;
            body.style.scrollBehavior = prev.bodyScrollBehavior;
        };
    }, [locked]);
}

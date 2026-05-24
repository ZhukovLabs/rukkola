'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'browser-compat-dismissed'

export function checkBrowserCompatibility(): boolean {
    try {
        const hasJS =
            typeof AbortSignal !== 'undefined' &&
            'timeout' in AbortSignal &&
            typeof structuredClone === 'function' &&
            typeof ResizeObserver !== 'undefined' &&
            typeof Element !== 'undefined' &&
            typeof Element.prototype.animate === 'function'

        const hasCSS =
            window.CSS &&
            CSS.supports('display', 'grid') &&
            CSS.supports('aspect-ratio', '1/1') &&
            CSS.supports('gap', '0px') &&
            CSS.supports('color', 'var(--x)')

        return hasJS && hasCSS
    } catch {
        return false
    }
}

function isDismissed(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
        return false
    }
}

function persistDismiss(): void {
    try {
        localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
        // localStorage недоступен
    }
}

function setBodyOffset(offset: string): void {
    try {
        document.body.style.paddingTop = offset
    } catch {
        // безопасность
    }
}

export function BrowserCompatibilityNotice() {
    const [showBanner, setShowBanner] = useState<boolean | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isDismissed()) {
            setBodyOffset('')
            setShowBanner(false)
            return
        }

        const isOld = typeof (window as any).__browserOld !== 'undefined'
            ? (window as any).__browserOld
            : !checkBrowserCompatibility()

        setShowBanner(isOld)
    }, [])

    useEffect(() => {
        if (showBanner === true) {
            setBodyOffset('54px')
        }

        return () => setBodyOffset('')
    }, [showBanner])

    const handleDismiss = useCallback(() => {
        setIsVisible(false)
    }, [])

    useEffect(() => {
        if (showBanner !== true) return

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleDismiss()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [showBanner, handleDismiss])

    useEffect(() => {
        if (showBanner !== true || isVisible) return

        timerRef.current = setTimeout(() => {
            persistDismiss()
            setBodyOffset('')
            setShowBanner(false)
        }, 300)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [showBanner, isVisible])

    if (showBanner !== true) return null

    const bg = '#000000'
    const textColor = '#ffffff'
    const borderColor = '#333333'
    const btnBg = isHovered || isFocused ? '#444444' : '#333333'
    const btnOutline = isFocused ? '2px solid #ffffff' : 'none'

    return (
        <div
            role="alert"
            aria-live="polite"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: bg,
                color: textColor,
                padding: '12px 20px',
                zIndex: 999999,
                borderBottom: `2px solid ${borderColor}`,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '14px',
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s ease'
            }}
        >
            <div style={{ maxWidth: '800px' }}>
                <strong>Ваш браузер устарел.</strong> Сайт может работать медленно или отображаться некорректно.
                Пожалуйста, обновите систему или используйте современный браузер (Chrome, Edge) для лучшего опыта.
                <button
                    onClick={handleDismiss}
                    aria-label="Закрыть уведомление"
                    style={{
                        marginLeft: '15px',
                        background: btnBg,
                        color: 'white',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        outline: btnOutline,
                        outlineOffset: '2px'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                >
                    OK
                </button>
            </div>
        </div>
    )
}

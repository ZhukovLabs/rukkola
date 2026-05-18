'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

type HCaptchaProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  resetKey?: number;
  language?: string;
};

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export const HCaptcha = ({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  resetKey,
  language = 'ru',
}: HCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const renderCaptcha = () => {
      if (!window.hcaptcha || !containerRef.current) return;

      try {
        if (widgetIdRef.current) {
          window.hcaptcha.reset(widgetIdRef.current);
        }

        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          hl: language,
          size: 'normal',
          callback: (token: string) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current?.(),
          'error-callback': () => onErrorRef.current?.(),
        });
      } catch (error) {
        console.error('Error rendering hCaptcha:', error);
      }
    };

    if (window.hcaptcha) {
      renderCaptcha();
    } else {
      const existingScript = document.querySelector(
        'script[src*="hcaptcha.com"]',
      );
      if (existingScript) {
        existingScript.addEventListener('load', renderCaptcha);
      } else {
        const script = document.createElement('script');
        script.src = `https://js.hcaptcha.com/1/api.js?hl=${language}`;
        script.async = true;
        script.defer = true;
        script.onload = renderCaptcha;
        script.onerror = () => console.error('Failed to load hCaptcha script');
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetIdRef.current && window.hcaptcha) {
        window.hcaptcha.reset(widgetIdRef.current);
      }
    };
  }, [siteKey, theme, resetKey, language]);

  if (!siteKey) return null;

  return (
    <Box
      ref={containerRef}
      id="hcaptcha-container"
      display="flex"
      justifyContent="center"
    />
  );
};
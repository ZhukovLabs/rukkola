'use client'

import {ChakraProvider, defaultConfig, createSystem} from '@chakra-ui/react'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "@/lib/auth/auth-context";
import {useMemo} from "react";
import {ToastProvider} from "@/components/toast-container";
import {ErrorBoundary} from "@/components/error-boundary";

type ProvidersProps = { children: React.ReactNode }

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: (failureCount, error) => {
                    if (failureCount >= 2) return false;
                    const message = (error as { message?: string })?.message;
                    if (message?.includes('401') || message?.includes('403')) return false;
                    return true;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                networkMode: 'online',
            },
            mutations: {
                retry: 1,
                retryDelay: 1000,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (typeof window === 'undefined') {
        return makeQueryClient()
    }
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
}

export function Providers({children}: ProvidersProps) {
    const queryClient = useMemo(() => getQueryClient(), [])
    const system = useMemo(() => createSystem(defaultConfig), [])
    
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={system}>
                    <ToastProvider>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </ToastProvider>
                </ChakraProvider>
            </QueryClientProvider>
        </AuthProvider>
    )
}

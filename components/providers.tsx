'use client'

import {ChakraProvider, defaultConfig, createSystem} from '@chakra-ui/react'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {SessionProvider} from "next-auth/react";
import {useMemo} from "react";
import {ToastProvider} from "@/components/toast-container";
import {ErrorBoundary} from "@/components/error-boundary";

type ProvidersProps = { children: React.ReactNode }

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: false,
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
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={system}>
                    <ToastProvider>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </ToastProvider>
                </ChakraProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}
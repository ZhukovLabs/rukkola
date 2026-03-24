import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

async function handleRevalidate(request: NextRequest): Promise<NextResponse> {
    console.log('=== handleRevalidate called ===');
    console.log('JWT_SECRET length:', JWT_SECRET.length);
    
    const authHeader = request.headers.get('authorization');
    console.log('authHeader:', authHeader ? 'present' : 'missing');
    
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized', debug: 'no bearer' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    console.log('token:', token.substring(0, 20) + '...');
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('token decoded:', decoded);
    } catch (e) {
        console.log('token verify error:', e);
        return NextResponse.json({ success: false, error: 'Invalid token', debug: e instanceof Error ? e.message : 'unknown' }, { status: 401 });
    }

    const body = await request.json();
    const { path } = body;

    if (path) {
        revalidatePath(path);
    }

    return NextResponse.json({
        success: true,
        revalidated: path,
        now: Date.now(),
    });
}

type RouteParams = {
    params: Promise<{ path: string[] }>;
};

const HOP_BY_HOP_HEADERS = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
    'host',
    'content-length',
]);

function normalizeServerRaw(raw?: string): URL {
    const original = raw ?? process.env.NEXT_PUBLIC_API_URL ?? '';
    console.log('normalizeServerRaw original:', original);
    const trimmed = original.trim();

    if (!trimmed) throw new Error('SERVER env is empty');

    const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
    const candidate = hasScheme ? trimmed : `http://${trimmed}`;

    let parsed: URL;
    try {
        parsed = new URL(candidate);
    } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        throw new Error(`Invalid SERVER value "${original}": ${err}`);
    }

    if (!parsed.hostname) {
        throw new Error(`Invalid SERVER value, missing hostname: "${original}"`);
    }

    return parsed;
}

function buildTargetUrl(serverUrl: URL, paths: string[], originalRequestUrl: string): URL {
    const basePath = (serverUrl.pathname || '').replace(/\/$/, '');

    const target = new URL(serverUrl.origin);
    target.pathname = basePath || '/';

    const cleanedSegments = paths
        .filter(Boolean)
        .map((p) => String(p).replace(/^\/+|\/+$/g, ''))
        .map((seg) => encodeURIComponent(seg));

    target.pathname = [basePath, ...cleanedSegments].filter(Boolean).join('/') || '/';

    const original = new URL(originalRequestUrl);
    target.search = original.search;

    return target;
}

async function proxyRequest(request: NextRequest, paths: string[]): Promise<NextResponse> {
    // Handle local routes directly - paths = ['revalidate'] or ['health']
    if (paths[0] === 'revalidate') {
        console.log('Handling revalidate locally');
        return handleRevalidate(request);
    }
    if (paths[0] === 'health') {
        return NextResponse.json({ status: 'ok' });
    }
    
    // All other paths go to backend
    const apiPaths = paths;
    console.log('Proxying to:', apiPaths);
    
    try {
        let serverUrl: URL;
        try {
            console.log('SERVER env:', process.env.SERVER);
            serverUrl = normalizeServerRaw(process.env.SERVER);
        } catch (e) {
            return NextResponse.json(
                {error: 'Invalid SERVER env', message: e instanceof Error ? e.message : String(e), serverValue: process.env.SERVER},
                {status: 500}
            );
        }

        const targetUrl = buildTargetUrl(serverUrl, apiPaths, request.url);

        const headers = new Headers();
        for (const [key, value] of request.headers) {
            if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
            headers.append(key, value);
        }
        headers.set('x-proxied-by', 'next-proxy');

        const method = request.method.toUpperCase();
        const init: RequestInit = {
            method,
            headers,
            redirect: 'manual',
            signal: request.signal,
        };

        if (method !== 'GET' && method !== 'HEAD') {
            init.body = request.body;
            // @ts-expect-error node fetch duplex
            init.duplex = 'half';
        }

        const upstream = await fetch(targetUrl.toString(), init);

        const responseHeaders = new Headers();
        for (const [key, value] of upstream.headers) {
            if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;
            responseHeaders.append(key, value);
        }

        return new NextResponse(upstream.body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: responseHeaders,
        });
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            {
                error: 'Failed to proxy request',
                message: err instanceof Error ? err.message : String(err),
            },
            {status: 500}
        );
    }
}

async function handler(request: NextRequest, {params}: RouteParams) {
    const {path} = await params;
    console.log('API request:', path);
    console.log('Method:', request.method);
    return proxyRequest(request, path ?? []);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;

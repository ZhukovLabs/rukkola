import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {verify} from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            return NextResponse.json(
                {success: false, error: 'Unauthorized'},
                {status: 401}
            );
        }

        try {
            verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json(
                {success: false, error: 'Unauthorized'},
                {status: 401}
            );
        }


        revalidatePath('/');
        return NextResponse.json({
            success: true,
            revalidated: '/',
            now: Date.now(),
        });
    } catch (error) {
        return NextResponse.json(
            {success: false, error: error instanceof Error ? error.message : 'Unknown error'},
            {status: 500}
        );
    }
}

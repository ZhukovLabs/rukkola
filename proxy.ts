import {auth} from "@/lib/auth"
import {NextResponse} from "next/server"

export default auth(async (req) => {
    const user = req.auth?.user;

    if (!user) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (req.nextUrl.pathname.startsWith("/dashboard") && !['admin', 'moderator'].includes(user.role!)) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/dashboard/:path*"],
}

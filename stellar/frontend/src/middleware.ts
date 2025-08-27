import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// Get the network environment from environment variables
	const networkEnv = process.env.NETWORK_ENV

	// If we're on mainnet (production), restrict access to only the homepage
	if (networkEnv === 'mainnet') {
		const { pathname } = request.nextUrl

		// Allow access to the homepage and static assets
		if (
			pathname === '/' ||
			pathname.startsWith('/_next/') ||
			pathname.startsWith('/api/') ||
			pathname.startsWith('/favicon.ico') ||
			pathname.startsWith('/assets/') ||
			pathname.startsWith('/images/') ||
			pathname.startsWith('/videos/')
		) {
			return NextResponse.next()
		}

		// Redirect all other routes to the homepage
		return NextResponse.redirect(new URL('/', request.url))
	}

	// For testnet, allow all routes
	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
} 
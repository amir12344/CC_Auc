import { NextRequest, NextResponse } from 'next/server'
import { redirectToLogin, validateAmplifySession } from './lib/auth/server-auth'

//  Middleware for converting the URL to lowercase and removing trailing slashes
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  let pathname = url.pathname

  // Skip middleware processing for image and static asset files
  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|mp4|webm|mp3|wav|pdf|doc|docx|xls|xlsx)$/i
  if (fileExtensionRegex.test(pathname)) {
    return NextResponse.next()
  }

  // 1. Check if lowercase redirect is needed
  const lowercasePathname = pathname.toLowerCase()
  const needsLowercase = pathname !== lowercasePathname

  // 2. Check if trailing slash removal is needed (except root path)
  const hasTrailingSlash = pathname !== '/' && pathname.endsWith('/')

  // If URL needs to be normalized (lowercase or trailing slash removal)
  if (needsLowercase || hasTrailingSlash) {
    let newPathname = pathname

    // Remove trailing slash if present (except for root path)
    if (hasTrailingSlash) {
      newPathname = newPathname.slice(0, -1)
    }

    // Convert to lowercase if needed
    if (needsLowercase) {
      newPathname = newPathname.toLowerCase()
    }

    // Create new URL with normalized path
    const newUrl = new URL(newPathname, request.url)
    newUrl.search = url.search

    // 308 = Permanent Redirect (better for SEO than 307)
    return NextResponse.redirect(newUrl, 308)
  }

  // 2. NEW: Authentication and Authorization
  const authResult = await validateAmplifySession(request)

  if (pathname.startsWith('/buyer') || pathname.startsWith('/seller')) {
    if (!authResult.isAuthenticated) {
      return redirectToLogin(request)
    }

    const { userRole } = authResult
    let hasRoleAccess = false
    if (pathname.startsWith('/buyer') && userRole === 'buyer') {
      hasRoleAccess = true
    } else if (pathname.startsWith('/seller') && userRole === 'seller') {
      hasRoleAccess = true
    }

    if (!hasRoleAccess) {
      const unauthorizedUrl = new URL('/unauthorized', request.url)
      unauthorizedUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  // Return the response from the auth validation, which may contain refreshed tokens
  return authResult.response || NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/      (Next.js internals)
     * - api/        (API routes)
     * - assets/     (if you use this for static assets)
     * - images/     (if you use this for image storage)
     * - static/     (if you use this directory for static files)
     * - Any files with extensions (.jpg, .png, etc.) - handled by regex in the middleware function
     */
    '/((?!_next/|api/|assets/|images/|static/).*)',
  ],
}

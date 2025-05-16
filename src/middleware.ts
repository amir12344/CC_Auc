import { NextRequest, NextResponse } from 'next/server';

//  Middleware for converting the URL to lowercase and removing trailing slashes
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Skip middleware processing for image and static asset files
  // This check provides a second layer of protection beyond the matcher
  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|mp4|webm|mp3|wav|pdf|doc|docx|xls|xlsx)$/i;
  if (fileExtensionRegex.test(pathname)) {
    return NextResponse.next();
  }

  // 1. Check if lowercase redirect is needed
  const lowercasePathname = pathname.toLowerCase();
  const needsLowercase = pathname !== lowercasePathname;
  
  // 2. Check if trailing slash removal is needed (except root path)
  const hasTrailingSlash = pathname !== '/' && pathname.endsWith('/');

  // If URL needs to be normalized (lowercase or trailing slash removal)
  if (needsLowercase || hasTrailingSlash) {
    let newPathname = pathname;
    
    // Remove trailing slash if present (except for root path)
    if (hasTrailingSlash) {
      newPathname = newPathname.slice(0, -1);
    }
    
    // Convert to lowercase if needed
    if (needsLowercase) {
      newPathname = newPathname.toLowerCase();
    }

    // Create new URL with normalized path
    const newUrl = new URL(request.url);
    newUrl.pathname = newPathname;
    
    // Preserve query parameters
    newUrl.search = url.search;

    // 308 = Permanent Redirect (better for SEO than 307)
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
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
    '/((?!_next/|api/|assets/|images/|static/).*)'
  ]
};

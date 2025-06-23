'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Suspense } from 'react';

function UnauthorizedContent() {
    const searchParams = useSearchParams();
    const from = searchParams.get('from');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full text-center">
                <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Access Denied
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    You do not have permission to access this page.
                </p>
                {from && (
                    <p className="mt-2 text-sm text-gray-500">
                        You were trying to access: <code>{from}</code>
                    </p>
                )}
                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Go to Homepage
                    </Link>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Login with a different account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UnauthorizedContent />
        </Suspense>
    );
} 
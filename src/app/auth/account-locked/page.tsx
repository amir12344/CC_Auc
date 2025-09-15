"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle, ArrowLeft, Mail, Phone } from "lucide-react";

export default function AccountLockedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-lg">
          <div className="mb-6 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-red-800">
            Account Locked
          </h1>

          <p className="mb-6 text-sm leading-relaxed text-red-800">
            Your account has been temporarily locked due to security concerns or
            policy violations. Please contact our customer support team to
            resolve this issue and regain access to your account.
          </p>

          <div className="space-y-4">
            <div className="border-t border-red-200 pt-4">
              <p className="mb-3 text-sm font-medium text-red-700">
                Contact Support:
              </p>
              <div className="space-y-3">
                <a
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                  href="mailto:team@commercecentral.ai"
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
              </div>
            </div>

            <div className="border-t border-red-200 pt-4">
              <p className="mb-3 text-xs text-red-600">
                Please have your account information ready when contacting
                support.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="mx-auto flex items-center justify-center gap-2 text-sm text-gray-600 underline hover:text-gray-800"
            onClick={() => router.push("/auth/login")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}

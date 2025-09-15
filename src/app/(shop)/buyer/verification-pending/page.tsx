"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Calendar, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { CalEmbed } from "@/src/app/(shop)/buyer/verification-pending/CalEmbed";
import { authService } from "@/src/features/authentication/services/authService";
import Logo from "@/src/features/website/components/ui/Logo";

export default function VerificationPendingPage() {
  const router = useRouter();
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [scheduledAtLocal, setScheduledAtLocal] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success("Successfully signed out");
      router.push("/auth/login");
    } catch {
      toast.error("Error signing out");
      // Fallback without touching Amplify when misconfigured
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/scheduling/my-booking", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to check booking");
        }
        const data = await res.json().catch(() => ({}));
        const booking = data?.booking ?? null;

        // Debug logging to help identify issues

        if (isMounted && booking) {
          setHasActiveBooking(true);
          if (booking.startTimeUtc) {
            const localDate = new Date(booking.startTimeUtc);
            setScheduledAtLocal(localDate.toLocaleString());
          }
        }
      } catch (error) {
        // On failure, default to showing the scheduler
      } finally {
        if (isMounted) setIsLoadingBooking(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header with logo and signout */}
      <div className="border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-6 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleSignOut}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSignOut();
              }}
              type="button"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-8xl mx-auto px-6 py-10 lg:py-12">
        {/* Status indicator and heading */}
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight text-gray-900 lg:text-5xl">
            Book time with our{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              sales team
            </span>
          </h1>
        </div>

        {/* Two-column content */}
        <div className="mt-16 grid grid-cols-1 gap-8 2xl:grid-cols-12 2xl:gap-16">
          {/* Left: supporting copy */}
          <div className="2xl:col-span-5">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                What to expect
              </h2>

              <div className="space-y-6">
                <p className="leading-relaxed text-gray-700">
                  Choose a time that works for you. Our team will confirm
                  details and help you get fully verified so you can start
                  buying.
                </p>
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Logo minWidth={80} size="small" variant="dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        The Commerce Central Team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: scheduler / booking state */}
          <div className="2xl:col-span-7">
            {isLoadingBooking ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-1/3 rounded-lg bg-gray-200" />
                <div className="h-96 w-full rounded-xl bg-gray-100" />
              </div>
            ) : hasActiveBooking ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-100 bg-green-50">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Verification Call Scheduled
                  </h3>
                  <div className="mb-6 space-y-3">
                    <p className="text-gray-600">
                      Your verification call has been confirmed
                    </p>
                    {scheduledAtLocal && (
                      <div className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {scheduledAtLocal}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm leading-relaxed text-gray-700">
                      We&apos;ll send you meeting reminders via email. If you
                      need to reschedule or cancel, please use the link in your
                      confirmation email.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <CalEmbed />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

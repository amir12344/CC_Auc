// Tiny helper to create client-only dynamic components with a small fallback
// Wraps next/dynamic with ssr:false and an optional loading node
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

interface LazyClientOptions {
  loading?: ReactNode;
}

export function lazyClient<TProps = Record<string, unknown>>(
  importer: () => Promise<{ default: ComponentType<TProps> }>,
  options?: LazyClientOptions
) {
  // Prevents code from being included in SSR output; renders tiny placeholder
  return dynamic(importer, {
    ssr: false,
    loading: () => <>{options?.loading ?? null}</>,
  }) as unknown as ComponentType<TProps>;
}

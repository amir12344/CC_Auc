import type { Metadata } from "next";

import { InboxClient } from "./InboxClient";

export const metadata: Metadata = {
  title: "Inbox | Commerce Central",
  description: "Manage your messages and communications",
};

/**
 * Inbox page for buyers to manage messages and communications
 * Server component that handles metadata and renders client component
 */
export default function InboxPage() {
  return <InboxClient />;
}

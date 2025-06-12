import { Messages } from "@/src/features/buyer-deals";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Manage your conversations and communications on Commerce Central.'
};

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Manage your conversations and communications.
        </p>
      </div>
      
      <Messages />
    </div>
  );
}

import Bids from "@/src/features/buyer-deals/components/Bids";

export default function BidsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">Bids</h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          View your bids. Here you can see the status of your bids, winning
          bids, and details about each bid placed.
        </p>
      </div>
      <Bids />
    </div>
  );
}

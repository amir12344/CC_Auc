import { CartInitIsland } from "./CartInitIsland";

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <CartInitIsland />
      {children}
    </>
  );
}

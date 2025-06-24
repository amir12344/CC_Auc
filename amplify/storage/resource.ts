import { defineStorage } from "@aws-amplify/backend";
import { createAuctionListingFromFile } from "../functions/create-auction-listing-from-file/resource";

export const storage = defineStorage({
  name: "commerceCentralStorage",
  access: (allow) => ({
    "ReSellCertificates/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
    "ReSellCertificates/public/*": [allow.authenticated.to(["read"])],

    // Auction Excel files storage
    "AuctionListings/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
    ],
    "AuctionManifests/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
    ],
    // Catalog Excel files storage
    "CatalogListings/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
    ],
    "CatalogSKUs/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
    ],
    "Images/Auction/{entity_id}/*": [
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
    ],
  }),
});

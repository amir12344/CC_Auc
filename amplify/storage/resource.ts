import { defineStorage } from "@aws-amplify/backend";

import { createAuctionListingFromFile } from "../functions/create-auction-listing-from-file/resource";
import { createCatalogListingFromFile } from "../functions/create-catalog-listing-from-file/resource";
import { createCatalogOfferFromFile } from "../functions/create-catalog-offer-from-file/resource";
import { createLotListing } from "../functions/create-lot-listing/resource";
import { notificationProcessor } from "../functions/notification-processor/resource";

export const storage = defineStorage({
  name: "commerceCentralStorage",
  isDefault: true,
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
        .resource(createCatalogListingFromFile)
        .to(["read", "write", "delete"]),
    ],
    "CatalogSKUs/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createCatalogListingFromFile)
        .to(["read", "write", "delete"]),
    ],

    "CatalogOffers/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow
        .resource(createCatalogOfferFromFile)
        .to(["read", "write", "delete"]),
    ],

    // Lot Listing media (images/videos) storage
    // Mirrors the reseller certificate pattern with per-user private folders
    "LotListingImages/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.resource(createLotListing).to(["read", "write", "delete"]),
    ],
    "LotListingVideos/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.resource(createLotListing).to(["read", "write", "delete"]),
    ],
    // Lot Listing manifests (excel/csv/pdf) storage
    "LotListingManifests/private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.resource(createLotListing).to(["read", "write", "delete"]),
    ],
  }),
});

export const imageStorage = defineStorage({
  name: "commerce-central-images",
  access: (allow) => ({
    "Images/Auction/*": [
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
      allow
        .resource(createCatalogListingFromFile)
        .to(["read", "write", "delete"]),
      allow.resource(notificationProcessor).to(["read", "write", "delete"]),
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
    ],
    "Images/Catalog/*": [
      allow
        .resource(createAuctionListingFromFile)
        .to(["read", "write", "delete"]),
      allow
        .resource(createCatalogListingFromFile)
        .to(["read", "write", "delete"]),
      allow.resource(notificationProcessor).to(["read", "write", "delete"]),
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
    ],
    "Images/Lot/*": [
      allow.resource(createLotListing).to(["read", "write", "delete"]),
      allow.resource(notificationProcessor).to(["read", "write", "delete"]),
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
    ],
  }),
});

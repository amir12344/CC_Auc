import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { Code, Function, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { createAuctionListingFromFile } from "./functions/create-auction-listing-from-file/resource";
import { queryData } from "./functions/query-data/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  queryData,
  createAuctionListingFromFile,
});

const queryDataFunction = backend.queryData.resources.lambda as Function;
const createAuctionListingFromFileFunction = backend
  .createAuctionListingFromFile.resources.lambda as Function;

export const backendStack = Stack.of(queryDataFunction);

// Add layer to lambda function
// AWS Lambda Layer docs: https://docs.aws.amazon.com/lambda/latest/dg/packaging-layers.html#packaging-layers-paths
const coreLayerVersion = new LayerVersion(
  backendStack,
  "commerceCentralLambdaLayer",
  {
    code: Code.fromAsset("./amplify/functions/lambda-layers/core-layer/"),
  }
);

queryDataFunction.addLayers(coreLayerVersion);
createAuctionListingFromFileFunction.addLayers(coreLayerVersion);

import { defineBackend } from "@aws-amplify/backend";

import { Duration, Names, Stack } from "aws-cdk-lib";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Code, Function, LayerVersion } from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CfnScheduleGroup } from "aws-cdk-lib/aws-scheduler";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";

import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { addUserAddress } from "./functions/add-user-address/resource";
import { completeAuction } from "./functions/complete-auction/resource";
import { createAuctionListingFromFile } from "./functions/create-auction-listing-from-file/resource";
import { createBuyerProfile } from "./functions/create-buyer-profile/resource";
import { createCatalogListingFromFile } from "./functions/create-catalog-listing-from-file/resource";
import { createCatalogOfferFromFile } from "./functions/create-catalog-offer-from-file/resource";
import { createCatalogOffer } from "./functions/create-catalog-offer/resource";
import { createLotListing } from "./functions/create-lot-listing/resource";
import { createSellerProfile } from "./functions/create-seller-profile/resource";
import { createUser } from "./functions/create-user/resource";
import { modifyAndAcceptCatalogOffer } from "./functions/modify-and-accept-catalog-offer/resource";
import { negotiateCatalogOffer } from "./functions/negotiate-catalog-offer/resource";
import { notificationProcessor } from "./functions/notification-processor/resource";
import { placeBid } from "./functions/place-bid/resource";
import { queryData } from "./functions/query-data/resource";
import { setBuyerPreferences } from "./functions/set-buyer-preferences/resource";
import { webSocketConnect } from "./functions/websocket-connect/resource";
import { webSocketDisconnect } from "./functions/websocket-disconnect/resource";
import { imageStorage, storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  imageStorage,
  queryData,
  createAuctionListingFromFile,
  createCatalogListingFromFile,
  placeBid,
  createCatalogOffer,
  negotiateCatalogOffer,
  createUser,
  createBuyerProfile,
  setBuyerPreferences,
  createSellerProfile,
  addUserAddress,
  completeAuction,
  notificationProcessor,
  modifyAndAcceptCatalogOffer,
  createCatalogOfferFromFile,
  webSocketConnect,
  webSocketDisconnect,
  createLotListing,
});

const queryDataFunction = backend.queryData.resources.lambda as Function;
const createAuctionListingFromFileFunction = backend
  .createAuctionListingFromFile.resources.lambda as Function;
const createCatalogListingFromFileFunction = backend
  .createCatalogListingFromFile.resources.lambda as Function;
const placeBidFunction = backend.placeBid.resources.lambda as Function;
const createCatalogOfferFunction = backend.createCatalogOffer.resources
  .lambda as Function;
const negotiateCatalogOfferFunction = backend.negotiateCatalogOffer.resources
  .lambda as Function;
const createUserFunction = backend.createUser.resources.lambda as Function;
const createBuyerProfileFunction = backend.createBuyerProfile.resources
  .lambda as Function;
const setBuyerPreferencesFunction = backend.setBuyerPreferences.resources
  .lambda as Function;
const createSellerProfileFunction = backend.createSellerProfile.resources
  .lambda as Function;
const addUserAddressFunction = backend.addUserAddress.resources
  .lambda as Function;
const completeAuctionFunction = backend.completeAuction.resources
  .lambda as Function;
const notificationProcessorFunction = backend.notificationProcessor.resources
  .lambda as Function;
const modifyAndAcceptCatalogOfferFunction = backend.modifyAndAcceptCatalogOffer
  .resources.lambda as Function;
const createCatalogOfferFromFileFunction = backend.createCatalogOfferFromFile
  .resources.lambda as Function;
const webSocketConnectFunction = backend.webSocketConnect.resources
  .lambda as Function;
const webSocketDisconnectFunction = backend.webSocketDisconnect.resources
  .lambda as Function;
const createLotListingFunction = backend.createLotListing.resources
  .lambda as Function;

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

// Add layer to all functions
const functionsToAddLayer = [
  queryDataFunction,
  createAuctionListingFromFileFunction,
  createCatalogListingFromFileFunction,
  placeBidFunction,
  createCatalogOfferFunction,
  negotiateCatalogOfferFunction,
  createUserFunction,
  createBuyerProfileFunction,
  setBuyerPreferencesFunction,
  createSellerProfileFunction,
  addUserAddressFunction,
  completeAuctionFunction,
  notificationProcessorFunction,
  modifyAndAcceptCatalogOfferFunction,
  createCatalogOfferFromFileFunction,
  webSocketConnectFunction,
  webSocketDisconnectFunction,
  createLotListingFunction,
];

functionsToAddLayer.forEach((func) => {
  func.addLayers(coreLayerVersion);
});

/// =================== WEBSOCKET API GATEWAY ===================

// Create WebSocket API Gateway
const uniqueId = Names.uniqueId(backendStack);
const shortId = uniqueId.slice(0, 15) + uniqueId.slice(-10);
const webSocketApi = new WebSocketApi(
  backendStack,
  shortId + "-NotificationWebSocketApi",
  {
    connectRouteOptions: {
      integration: new WebSocketLambdaIntegration(
        shortId + "-ConnectIntegration",
        webSocketConnectFunction
      ),
    },
    disconnectRouteOptions: {
      integration: new WebSocketLambdaIntegration(
        shortId + "-DisconnectIntegration",
        webSocketDisconnectFunction
      ),
    },
  }
);

// Create stage with dynamic naming
const webSocketStage = new WebSocketStage(backendStack, shortId + "-WSStage", {
  webSocketApi,
  stageName: "api",
  autoDeploy: true,
});

// =================== PERMISSIONS ===================

// Grant API Gateway Management permissions to notification processor
notificationProcessorFunction.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["execute-api:ManageConnections"],
    resources: [
      `arn:aws:execute-api:${backendStack.region}:${backendStack.account}:${webSocketApi.apiId}/*/*`,
    ],
  })
);

// =================== ENVIRONMENT VARIABLES ===================

notificationProcessorFunction.addEnvironment(
  "WEBSOCKET_API_ENDPOINT",
  `https://${webSocketApi.apiId}.execute-api.${backendStack.region}.amazonaws.com/${webSocketStage.stageName}`
);

// Create unified SNS Topic for all notifications
const unifiedNotificationTopic = new Topic(
  backendStack,
  "unifiedNotificationTopic",
  {
    displayName: "Commerce Central Notifications",
    // Remove hardcoded topicName - let CloudFormation auto-generate it
  }
);

const auctionCompletionDLQ = new Queue(
  backendStack,
  "auctionCompletionDeadLetterQueue",
  {
    // Remove hardcoded queueName - let CloudFormation auto-generate it
    retentionPeriod: Duration.days(14), // Keep failed messages for 14 days
  }
);

unifiedNotificationTopic.addSubscription(
  new LambdaSubscription(notificationProcessorFunction)
);

// Create IAM role for EventBridge Scheduler to invoke Lambda functions
const schedulerExecutionRole = new Role(
  backendStack,
  "schedulerExecutionRole",
  {
    assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
    description:
      "Role for EventBridge Scheduler to invoke auction completion Lambda",
  }
);

// Add permissions to invoke the completeAuction Lambda function
schedulerExecutionRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["lambda:InvokeFunction"],
    resources: [completeAuctionFunction.functionArn],
  })
);

schedulerExecutionRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["sqs:SendMessage"],
    resources: [auctionCompletionDLQ.queueArn],
  })
);

// Add environment variables and permissions for notification functions
const notificationFunctions = [
  completeAuctionFunction,
  placeBidFunction,
  createCatalogOfferFunction,
  createCatalogOfferFromFileFunction,
  negotiateCatalogOfferFunction,
  modifyAndAcceptCatalogOfferFunction,
  createUserFunction,
];

notificationFunctions.forEach((func) => {
  // Add unified notification topic ARN
  func.addEnvironment(
    "NOTIFICATION_TOPIC_ARN",
    unifiedNotificationTopic.topicArn
  );

  // Add SNS publish permissions
  func.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["sns:Publish"],
      resources: [unifiedNotificationTopic.topicArn],
    })
  );
});

const auctionSchedulerGroup = new CfnScheduleGroup(
  backendStack,
  "auctionCompletionScheduleGroup"
  // Remove the hardcoded 'name' property - let CloudFormation auto-generate it
);

// Add scheduler-specific environment variables and permissions
const schedulerFunctions = [
  completeAuctionFunction,
  createAuctionListingFromFileFunction,
  placeBidFunction,
];

schedulerFunctions.forEach((func) => {
  // Add scheduler role ARN
  func.addEnvironment(
    "EVENTBRIDGE_SCHEDULER_ROLE_ARN",
    schedulerExecutionRole.roleArn
  );

  // Add scheduler permissions with auto-generated resource ARN
  func.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "scheduler:CreateSchedule",
        "scheduler:UpdateSchedule",
        "scheduler:DeleteSchedule",
        "scheduler:GetSchedule",
      ],
      resources: [
        `arn:aws:scheduler:${backendStack.region}:${backendStack.account}:schedule/${auctionSchedulerGroup.ref}/*`,
      ],
    })
  );

  func.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["iam:PassRole"],
      resources: [schedulerExecutionRole.roleArn],
    })
  );

  func.addEnvironment("AUCTION_DLQ_ARN", auctionCompletionDLQ.queueArn);

  // Add the schedule group name as an environment variable (auto-generated)
  func.addEnvironment("SCHEDULE_GROUP_NAME", auctionSchedulerGroup.ref);
});

// Add completeAuction function ARN to functions that need to create schedules
const functionsNeedingCompleteAuctionArn = [
  createAuctionListingFromFileFunction,
  placeBidFunction,
];

functionsNeedingCompleteAuctionArn.forEach((func) => {
  func.addEnvironment(
    "COMPLETE_AUCTION_FUNCTION_ARN",
    completeAuctionFunction.functionArn
  );
});

// Add auth environment variables to placeBid function
placeBidFunction.addEnvironment(
  "AMPLIFY_USERPOOL_ID",
  backend.auth.resources.userPool.userPoolId
);
placeBidFunction.addEnvironment(
  "AMPLIFY_USERPOOL_CLIENT_ID",
  backend.auth.resources.userPoolClient.userPoolClientId
);

notificationProcessorFunction.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["ses:SendEmail", "ses:SendRawEmail"],
    resources: ["*"],
  })
);

notificationProcessorFunction.addEnvironment(
  "FROM_EMAIL",
  "team@commercecentral.ai"
);

// Enable acceleration for images S3 bucket
const s3ImageBucket = backend.imageStorage.resources.bucket;
const cfnImageBucket = s3ImageBucket.node.defaultChild as s3.CfnBucket;
cfnImageBucket.accelerateConfiguration = {
  accelerationStatus: "Enabled",
};

// Export important ARNs for reference
export const unifiedNotificationTopicArn = unifiedNotificationTopic.topicArn;
export const schedulerExecutionRoleArn = schedulerExecutionRole.roleArn;
export const completeAuctionFunctionArn = completeAuctionFunction.functionArn;
export const scheduleGroupName = auctionSchedulerGroup.ref;

// Export WebSocket resources
export const webSocketApiId = webSocketApi.apiId;
export const webSocketUrl = `wss://${webSocketApi.apiId}.execute-api.${backendStack.region}.amazonaws.com/${webSocketStage.stageName}`;

backend.addOutput({
  custom: {
    webSocketApiId: webSocketApi.apiId,
    webSocketUrl: `wss://${webSocketApi.apiId}.execute-api.${backendStack.region}.amazonaws.com/${webSocketStage.stageName}`,
  },
});

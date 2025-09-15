// amplify/functions/notification-processor/handler.ts
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import {
  SendEmailCommand as SendEmailV2Command,
  SESv2Client,
} from "@aws-sdk/client-sesv2";

import { env } from "$amplify/env/notification-processor";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { SNSEvent } from "aws-lambda";

import { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import {
  CatalogOfferNotificationData,
  NotificationEventType,
  NotificationMessage,
} from "../commons/utilities/UnifiedNotificationService";
import { PrismaClient } from "../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { getAuctionCompletedEmailTemplate } from "./email-templates/AuctionCompletedEmails";
import {
  getBidPlacedEmailTemplate,
  getBuyerBidConfirmationEmailTemplate,
  getOutbidEmailTemplate,
} from "./email-templates/BidPlacedEmails";
import { getCatalogOfferAcceptedEmailTemplate } from "./email-templates/CatalogOfferAcceptedEmails";
import { getCatalogOfferEmailTemplate } from "./email-templates/CatalogOfferEmails";
import { getOrderCreatedEmailTemplate } from "./email-templates/OrderCreatedEmails";
import { getUserWelcomeEmailTemplate } from "./email-templates/UserWelcomeEmails";
import { BidNotificationService } from "./services/bidNotificationService";
import { CatalogOfferDataService } from "./services/catalogOfferDataService";
import { CatalogOfferExcelService } from "./services/catalogOfferExcelService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

const sesv2Client = new SESv2Client({ region: env.AWS_REGION });

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

// Initialize API Gateway Management API client for WebSocket
let apiGatewayClient: ApiGatewayManagementApiClient;
if (env.WEBSOCKET_API_ENDPOINT) {
  apiGatewayClient = new ApiGatewayManagementApiClient({
    region: env.AWS_REGION,
    endpoint: env.WEBSOCKET_API_ENDPOINT,
  });
}

export const handler = async (event: SNSEvent): Promise<void> => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log(`Processing ${event.Records.length} notification(s)`);

  // Initialize database connection
  const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
    env.DB_CONNECTION_DETAILS
  );
  const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

  const prismaClient = (await importModuleFromLayer())?.prismaClient(
    prismaDataSourceUrl
  )!;

  if (!prismaClient) {
    throw new Error("Failed to initialize database connection");
  }

  for (const record of event.Records) {
    try {
      const message: NotificationMessage = JSON.parse(record.Sns.Message);

      console.log(
        `Processing notification: ${message.eventType} for user: ${message.userId}`
      );

      // Route based on notification channel
      switch (message.notificationChannel) {
        case "EMAIL":
          await processEmailNotification(
            message,
            record.Sns.Subject || "",
            prismaClient
          );
          break;

        case "WEB":
          await processWebNotification(message);
          break;

        case "SMS":
          await processSMSNotification(message);
          break;

        case "PUSH":
          await processPushNotification(message);
          break;

        default:
          console.warn(
            `Unknown notification channel: ${message.notificationChannel}`
          );
      }
    } catch (error) {
      console.error("Failed to process notification record:", error);
      // Continue processing other records
    }
  }
};

// =================== WEBSOCKET IMPLEMENTATION ===================

async function processWebNotification(
  message: NotificationMessage
): Promise<void> {
  try {
    console.log("Processing web notification:", message.eventType);

    // 1. Store notification in Amplify-generated table using Amplify client
    await storeWebNotification({
      userId: message.userId,
      type: message.eventType,
      title: getNotificationTitle(message.eventType, message.data),
      message: getNotificationText(message),
      data: message.data,
      timestamp: message.timestamp,
      read: false,
    });

    // 2. Send real-time WebSocket notification if user is connected
    await sendWebSocketNotification(message.userId, {
      type: message.eventType,
      title: getNotificationTitle(message.eventType, message.data),
      message: getNotificationText(message),
      data: message.data,
      timestamp: message.timestamp,
    });

    console.log(`WebSocket notification processed for user: ${message.userId}`);
  } catch (error) {
    console.error("Failed to process web notification:", error);
    throw error;
  }
}

async function storeWebNotification(notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}): Promise<void> {
  try {
    const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days TTL
    const now = new Date().toISOString();

    // Use Amplify client to create notification record
    const { data: createdNotification, errors } =
      await client.models.NotificationStorage.create({
        userId: notification.userId,
        timestamp: notification.timestamp,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: JSON.stringify(notification.data), // Stringify the data object
        notificationRead: notification.read,
        ttl: ttl,
        createdAt: now,
      });

    if (errors) {
      console.error("Error storing notification:", errors);
      throw new Error(`Failed to store notification: ${errors}`);
    }

    console.log(`Notification stored for user: ${notification.userId}`);
  } catch (error) {
    console.error("Failed to store notification:", error);
    throw error;
  }
}

async function getUserConnections(userId: string): Promise<string[]> {
  try {
    // Use Amplify client to query connections by userId using the GSI
    const { data, errors } =
      await client.models.WebSocketConnection.connectionsByUserId({
        userId: userId,
      });

    if (errors) {
      console.error("Error getting user connections:", errors);
      return [];
    }

    return data.map((connection) => connection.id); // Use id field which contains connectionId
  } catch (error) {
    console.error("Error getting user connections:", error);
    return [];
  }
}

async function sendWebSocketNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data: any;
    timestamp: string;
  }
): Promise<void> {
  try {
    if (!apiGatewayClient) {
      console.log("WebSocket API Gateway client not initialized");
      return;
    }

    // Get all active connections for the user
    const connectionIds = await getUserConnections(userId);

    if (connectionIds.length === 0) {
      console.log(`No active WebSocket connections for user: ${userId}`);
      return;
    }

    // Send notification to all user's connections
    const sendPromises = connectionIds.map(async (connectionId) => {
      try {
        await apiGatewayClient.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(
              JSON.stringify({
                action: "notification",
                ...notification,
              })
            ),
          })
        );

        console.log(
          `WebSocket notification sent to connection: ${connectionId}`
        );
      } catch (error: any) {
        console.error(`Failed to send to connection ${connectionId}:`, error);

        // Remove stale connections (410 = Gone)
        if (error.statusCode === 410) {
          await cleanupStaleConnection(connectionId);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error("Failed to send WebSocket notification:", error);
    throw error;
  }
}

async function cleanupStaleConnection(connectionId: string): Promise<void> {
  try {
    // Use Amplify client to delete stale connection
    const { errors } = await client.models.WebSocketConnection.delete({
      id: connectionId, // Use id field instead of connectionId
    });

    if (errors) {
      console.error(`Failed to cleanup connection ${connectionId}:`, errors);
    } else {
      console.log(`Cleaned up stale connection: ${connectionId}`);
    }
  } catch (error) {
    console.error(`Failed to cleanup connection ${connectionId}:`, error);
  }
}

// =================== EMAIL FUNCTIONS ===================

async function processEmailNotification(
  message: NotificationMessage,
  subject: string,
  prismaClient: PrismaClient
): Promise<void> {
  try {
    const { emailTemplate, recipientEmail } =
      await getEmailTemplateAndRecipient(message, prismaClient);

    if (!recipientEmail) {
      console.warn(
        `No recipient email found for notification: ${message.eventType}`
      );
      return;
    }

    // Use specific email source for catalog offer events
    const emailSource =
      message.eventType === NotificationEventType.CATALOG_OFFER_CREATED
        ? "offers@commercecentral.ai"
        : process.env.FROM_EMAIL || "noreply@commercecentral.ai";

    // Handle CATALOG_OFFER_CREATED with Excel attachment
    if (message.eventType === NotificationEventType.CATALOG_OFFER_CREATED) {
      await sendCatalogOfferEmailWithAttachment(
        message,
        emailTemplate,
        recipientEmail,
        emailSource,
        subject,
        prismaClient,
        ["shivang@commercecentral.ai"]
      );
    } else {
      // Add CC for specific email types
      const ccRecipients =
        message.eventType === NotificationEventType.USER_WELCOME
          ? ["shivang@commercecentral.ai"]
          : [];

      await sendSimpleEmail(
        emailTemplate,
        recipientEmail,
        emailSource,
        subject,
        ccRecipients
      );
    }

    const ccInfo =
      message.eventType === NotificationEventType.USER_WELCOME ||
      message.eventType === NotificationEventType.CATALOG_OFFER_CREATED
        ? " (CC: shivang@commercecentral.ai)"
        : "";
    console.log(
      `Email sent successfully to ${recipientEmail}${ccInfo} for ${message.eventType}`
    );
  } catch (error) {
    console.error("Failed to send email notification:", error);
    throw error;
  }
}

async function getEmailTemplateAndRecipient(
  message: NotificationMessage,
  prismaClient: PrismaClient
): Promise<{
  emailTemplate: string;
  recipientEmail: string;
}> {
  switch (message.eventType) {
    case "AUCTION_COMPLETED":
      return getAuctionCompletedEmailTemplate(message);

    case "BID_PLACED":
      return await getBidPlacedEmailTemplateHandler(message, prismaClient);

    case "BID_CONFIRMATION":
      return await getBuyerBidConfirmationEmailTemplateHandler(
        message,
        prismaClient
      );

    case "OUTBID":
      return await getOutbidEmailTemplateHandler(message, prismaClient);

    case "CATALOG_OFFER_CREATED":
      return getCatalogOfferEmailTemplate(message);

    case "CATALOG_OFFER_ACCEPTED":
      return getCatalogOfferAcceptedEmailTemplate(message);

    case "ORDER_CREATED":
      return getOrderCreatedEmailTemplate(message);

    case "ORDER_STATUS_UPDATED":
      return getOrderStatusEmailTemplate(message);

    case "USER_WELCOME":
      return getUserWelcomeEmailTemplate(message);

    default:
      return {
        emailTemplate: getGenericEmailTemplate(message),
        recipientEmail: message.data.email || "",
      };
  }
}

async function getBidPlacedEmailTemplateHandler(
  message: NotificationMessage,
  prismaClient: PrismaClient
): Promise<{
  emailTemplate: string;
  recipientEmail: string;
}> {
  const data = message.data;

  // Use the service to fetch notification data
  const emailData = await BidNotificationService.getBidNotificationData(
    data.auctionListingId,
    data.bidderId,
    prismaClient
  );

  if (!emailData) {
    throw new Error(
      `Failed to fetch bid notification data for auction ID: ${data.auctionListingId}`
    );
  }

  // Populate data from the notification message
  emailData.bidAmount = data.bidAmount;
  emailData.currency = data.currency;
  emailData.currentHighBid = data.currentHighBid;

  // Use the email template to generate the email
  return getBidPlacedEmailTemplate(emailData);
}

async function getBuyerBidConfirmationEmailTemplateHandler(
  message: NotificationMessage,
  prismaClient: PrismaClient
): Promise<{
  emailTemplate: string;
  recipientEmail: string;
}> {
  const data = message.data;

  // Use the service to fetch buyer confirmation data
  const emailData = await BidNotificationService.getBuyerBidConfirmationData(
    data.auctionListingId,
    data.bidderId,
    prismaClient
  );

  if (!emailData) {
    throw new Error(
      `Failed to fetch buyer bid confirmation data for auction ID: ${data.auctionListingId}`
    );
  }

  // Populate data from the notification message
  emailData.bidAmount = data.bidAmount;
  emailData.currency = data.currency;
  emailData.currentHighBid = data.currentHighBid;
  emailData.isWinningBid = data.isWinningBid;

  // Use the email template to generate the email
  return getBuyerBidConfirmationEmailTemplate(emailData);
}

async function getOutbidEmailTemplateHandler(
  message: NotificationMessage,
  prismaClient: PrismaClient
): Promise<{
  emailTemplate: string;
  recipientEmail: string;
}> {
  const data = message.data;

  // Use the service to fetch outbid email data
  const emailData = await BidNotificationService.getOutbidEmailData(
    data.auctionListingId,
    data.outbidUserId,
    data.newHighBid,
    prismaClient
  );

  if (!emailData) {
    throw new Error(
      `Failed to fetch outbid email data for user ID: ${data.outbidUserId}`
    );
  }

  // Populate data from the notification message
  emailData.previousBidAmount = data.previousBidAmount;
  emailData.newHighBid = data.newHighBid;
  emailData.currency = data.currency;

  // Use the email template to generate the email
  return getOutbidEmailTemplate(emailData);
}

function getOrderStatusEmailTemplate(message: NotificationMessage): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data;

  return {
    recipientEmail: data.buyerInfo?.email || "",
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2196f3;">📦 Order Status Update</h1>
          
          <p>Your order status has been updated:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order ${data.orderNumber}</h3>
            <p><strong>Status:</strong> ${data.newStatus}</p>
            <p><strong>Total:</strong> ${data.currency} ${data.totalAmount.toLocaleString()}</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `,
  };
}

function getGenericEmailTemplate(message: NotificationMessage): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Notification</h1>
        <p>You have received a notification regarding: ${message.eventType}</p>
        <p>Event Type: ${message.eventType}</p>
        <p>Timestamp: ${message.timestamp}</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

async function sendCatalogOfferEmailWithAttachment(
  message: NotificationMessage,
  emailTemplate: string,
  recipientEmail: string,
  emailSource: string,
  subject: string,
  prismaClient: PrismaClient,
  ccRecipients: string[] = []
): Promise<void> {
  try {
    const data = message.data as CatalogOfferNotificationData;

    // Extract offer ID from the message data
    const offerId = data.offerId || message.entityId;

    if (!offerId) {
      console.warn("No offer ID found for CATALOG_OFFER_CREATED notification");
      // Fall back to sending email without attachment
      await sendSimpleEmail(
        emailTemplate,
        recipientEmail,
        emailSource,
        subject,
        ccRecipients
      );
      return;
    }

    // Fetch complete offer data
    const offerData = await CatalogOfferDataService.getCatalogOfferData(
      offerId,
      prismaClient
    );

    if (!offerData) {
      console.warn(`Could not fetch offer data for ID: ${offerId}`);
      // Fall back to sending email without attachment
      await sendSimpleEmail(
        emailTemplate,
        recipientEmail,
        emailSource,
        subject,
        ccRecipients
      );
      return;
    }

    // Determine recipient type and generate Excel
    const recipientType: "BUYER" | "SELLER" =
      data.recipientType === "BUYER" ? "BUYER" : "SELLER";
    const fileName = CatalogOfferExcelService.generateFileName(
      offerData,
      recipientType
    );

    const excelConfig = {
      fileName,
      sheetName: "Catalog Offer Details",
      recipientType,
      includeImages: true, // Enable images now that S3 retrieval is implemented
      includeNegotiationHistory: true,
    };

    console.log(
      `Generating Excel attachment for ${recipientType}: ${fileName}`
    );

    const excelResult = await CatalogOfferExcelService.generateOfferExcel(
      offerData,
      excelConfig,
      (progress) => {
        console.log(
          `Excel generation progress: ${progress.stage} - ${progress.progress}%`
        );
      }
    );

    if (!excelResult.success || !excelResult.fileBuffer) {
      console.warn(`Excel generation failed: ${excelResult.error}`);
      // Fall back to sending email without attachment
      await sendSimpleEmail(
        emailTemplate,
        recipientEmail,
        emailSource,
        subject
      );
      return;
    }

    // Create multipart email with attachment using SES v2
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36)}`;

    const rawEmailContent = createRawEmailWithAttachment(
      emailSource,
      recipientEmail,
      subject,
      emailTemplate,
      excelResult.fileBuffer,
      fileName,
      boundary
    );

    const emailCommand = new SendEmailV2Command({
      FromEmailAddress: emailSource,
      Destination: {
        ToAddresses: [recipientEmail],
        ...(ccRecipients.length > 0 && { CcAddresses: ccRecipients }),
      },
      Content: {
        Raw: {
          Data: rawEmailContent,
        },
      },
    });

    await sesv2Client.send(emailCommand);
    const ccInfo =
      ccRecipients.length > 0 ? ` (CC: ${ccRecipients.join(", ")})` : "";
    console.log(
      `Email with Excel attachment sent successfully to ${recipientEmail}${ccInfo}`
    );
  } catch (error) {
    console.error("Failed to send catalog offer email with attachment:", error);
    // Fall back to sending simple email without attachment
    try {
      await sendSimpleEmail(
        emailTemplate,
        recipientEmail,
        emailSource,
        subject,
        ccRecipients
      );
      const fallbackCcInfo =
        ccRecipients.length > 0 ? ` (CC: ${ccRecipients.join(", ")})` : "";
      console.log(
        `Fallback email sent successfully without attachment${fallbackCcInfo}`
      );
    } catch (fallbackError) {
      console.error("Fallback email also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

async function sendSimpleEmail(
  emailTemplate: string,
  recipientEmail: string,
  emailSource: string,
  subject: string,
  ccRecipients: string[] = []
): Promise<void> {
  const emailCommand = new SendEmailV2Command({
    FromEmailAddress: emailSource,
    Destination: {
      ToAddresses: [recipientEmail],
      ...(ccRecipients.length > 0 && { CcAddresses: ccRecipients }),
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: emailTemplate,
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  await sesv2Client.send(emailCommand);
}

function createRawEmailWithAttachment(
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlContent: string,
  attachmentBuffer: Buffer,
  attachmentFileName: string,
  boundary: string
): Buffer {
  const rawEmail = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    htmlContent,
    "",
    `--${boundary}`,
    `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="${attachmentFileName}"`,
    "",
    attachmentBuffer.toString("base64"),
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return Buffer.from(rawEmail);
}

// =================== HELPER FUNCTIONS ===================

function getNotificationTitle(eventType: string, data: any): string {
  switch (eventType) {
    case "AUCTION_COMPLETED":
      return data.hasWinner ? "Auction Won!" : "Auction Ended";
    case "BID_PLACED":
      return "New Bid Received";
    case "CATALOG_OFFER_CREATED":
      if (data.recipientType === "SELLER") {
        return "New Offer Received";
      } else {
        return "Offer Submitted Successfully";
      }
    case "CATALOG_OFFER_ACCEPTED":
      if (data.recipientType === "BUYER") {
        return "Offer Accepted!";
      } else {
        return "Offer Acceptance Confirmed";
      }
    case "ORDER_CREATED":
      if (data.recipientType === "BUYER") {
        return "Order Created";
      } else {
        return "New Order Received";
      }
    case "ORDER_STATUS_UPDATED":
      return "Order Status Updated";
    case "USER_WELCOME":
      return "Welcome to Commerce Central!";
    default:
      return "Notification";
  }
}

function getNotificationText(message: NotificationMessage): string {
  const data = message.data;

  switch (message.eventType) {
    case "AUCTION_COMPLETED":
      if (data.winnerInfo && data.winnerInfo.userId === message.userId) {
        return `Congratulations! You won "${data.auctionTitle}" for ${data.currency} ${data.finalBidAmount.toLocaleString()}`;
      } else if (data.hasWinner) {
        return `Your auction "${data.auctionTitle}" sold for ${data.currency} ${data.finalBidAmount.toLocaleString()}`;
      } else {
        return `Your auction "${data.auctionTitle}" ended without bids`;
      }

    case "BID_PLACED":
      return `New bid of ${data.currency} ${data.bidAmount.toLocaleString()} on "${data.auctionTitle}"`;

    case "CATALOG_OFFER_CREATED":
      if (data.recipientType === "SELLER") {
        return `New offer of ${data.currency} ${data.offerAmount.toLocaleString()} on "${data.catalogTitle}" from ${data.buyerInfo.name}`;
      } else {
        return `Your offer of ${data.currency} ${data.offerAmount.toLocaleString()} on "${data.catalogTitle}" has been submitted successfully`;
      }

    case "CATALOG_OFFER_ACCEPTED":
      if (data.recipientType === "BUYER") {
        return `Great news! Your offer of ${data.currency} ${data.finalOfferAmount.toLocaleString()} on "${data.catalogTitle}" has been accepted${data.orderCreated ? " and an order has been created" : ""}`;
      } else {
        return `You have accepted the offer of ${data.currency} ${data.finalOfferAmount.toLocaleString()} on "${data.catalogTitle}" from ${data.buyerInfo.name}`;
      }

    case "ORDER_CREATED":
      if (data.recipientType === "BUYER") {
        return `Your order ${data.orderNumber} has been created for ${data.currency} ${data.totalAmount.toLocaleString()} from ${data.sourceType === "AUCTION" ? "auction win" : "catalog offer"}: "${data.sourceTitle}"`;
      } else {
        return `New order ${data.orderNumber} received for ${data.currency} ${data.totalAmount.toLocaleString()} from ${data.sourceType === "AUCTION" ? "auction sale" : "catalog listing"}: "${data.sourceTitle}"`;
      }

    case "ORDER_STATUS_UPDATED":
      return `Order ${data.orderNumber} status updated to ${data.newStatus}`;

    case "USER_WELCOME":
      return `Welcome to Commerce Central, ${data.userName}! Your ${data.userType.replace("_", " & ").toLowerCase()} account is ready to use.`;

    default:
      return `You have a new ${message.eventType.toLowerCase().replace("_", " ")} notification`;
  }
}

// =================== OTHER NOTIFICATION CHANNELS ===================

async function processSMSNotification(
  message: NotificationMessage
): Promise<void> {
  try {
    // Only send SMS for high priority notifications
    if (message.priority !== "HIGH" && message.priority !== "URGENT") {
      console.log("Skipping SMS for non-urgent notification");
      return;
    }

    const smsText = getSMSText(message);
    const phoneNumber = await getUserPhoneNumber(message.userId);

    if (!phoneNumber) {
      console.warn(`No phone number found for user: ${message.userId}`);
      return;
    }

    // Use SNS to send SMS
    const { SNSClient, PublishCommand } = await import("@aws-sdk/client-sns");
    const snsClient = new SNSClient({ region: process.env.AWS_REGION });

    await snsClient.send(
      new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: smsText,
      })
    );

    console.log(`SMS sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    throw error;
  }
}

async function processPushNotification(
  message: NotificationMessage
): Promise<void> {
  try {
    console.log("Processing push notification:", message.eventType);

    const pushPayload = {
      userId: message.userId,
      title: getNotificationTitle(message.eventType, message.data),
      body: getNotificationText(message),
      data: message.data,
      badge: await getUnreadNotificationCount(message.userId),
    };

    // Send push notification (implementation depends on your push service)
    await sendPushNotification(pushPayload);
  } catch (error) {
    console.error("Failed to send push notification:", error);
    throw error;
  }
}

function getSMSText(message: NotificationMessage): string {
  const data = message.data;

  switch (message.eventType) {
    case "AUCTION_COMPLETED":
      if (data.winnerInfo && data.winnerInfo.userId === message.userId) {
        return `🎉 You won "${data.auctionTitle}" for ${data.currency}${data.finalBidAmount.toLocaleString()}! Check your email for next steps.`;
      } else if (data.hasWinner) {
        return `✅ Your auction "${data.auctionTitle}" sold for ${data.currency}${data.finalBidAmount.toLocaleString()}!`;
      } else {
        return `📝 Your auction "${data.auctionTitle}" ended without bids.`;
      }

    case "ORDER_STATUS_UPDATED":
      if (data.newStatus === "SHIPPED") {
        return `📦 Your order ${data.orderNumber} has been shipped!`;
      }
      return `📋 Order ${data.orderNumber} status: ${data.newStatus}`;

    default:
      return `New notification: ${message.eventType}`;
  }
}

// Mock implementations - replace with your actual implementations
async function getUserPhoneNumber(userId: string): Promise<string | null> {
  // Get user's phone number from database
  console.log(`Getting phone number for user: ${userId}`);
  return null; // Return actual phone number
}

async function sendPushNotification(payload: any): Promise<void> {
  // Send push notification via your push service
  console.log("Sending push notification:", payload);
}

async function getUnreadNotificationCount(userId: string): Promise<number> {
  // Get count of unread notifications for badge
  console.log(`Getting unread count for user: ${userId}`);
  return 0;
}

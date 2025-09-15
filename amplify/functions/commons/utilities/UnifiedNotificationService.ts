import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

export enum NotificationEventType {
  AUCTION_COMPLETED = "AUCTION_COMPLETED",
  BID_PLACED = "BID_PLACED",
  BID_CONFIRMATION = "BID_CONFIRMATION",
  OUTBID = "OUTBID",
  CATALOG_OFFER_CREATED = "CATALOG_OFFER_CREATED",
  CATALOG_OFFER_UPDATED = "CATALOG_OFFER_UPDATED",
  CATALOG_OFFER_ACCEPTED = "CATALOG_OFFER_ACCEPTED",
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_STATUS_UPDATED = "ORDER_STATUS_UPDATED",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  ACCOUNT_SECURITY = "ACCOUNT_SECURITY",
  URGENT_ALERT = "URGENT_ALERT",
  USER_WELCOME = "USER_WELCOME",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationEntityType {
  AUCTION = "AUCTION",
  CATALOG_OFFER = "CATALOG_OFFER",
  ORDER = "ORDER",
  USER = "USER",
}

export interface CatalogOfferNotificationData {
  offerId: string; // Public id
  catalogTitle: string;
  catalogId: string; // Public id
  offerAmount: number;
  currency: string;
  itemCount: number;
  buyerInfo: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  sellerInfo?: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  recipientType?: "BUYER" | "SELLER";
}

export interface CatalogOfferAcceptedNotificationData {
  offerId: string; // Public id
  catalogTitle: string;
  catalogId: string; // Public id
  finalOfferAmount: number;
  currency: string;
  itemCount: number;
  buyerInfo: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  sellerInfo: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  orderCreated?: boolean;
  orderId?: string; // Public id if order was created
  orderNumber?: string; // User-friendly order number if order was created
  sellerMessage?: string;
  recipientType: "BUYER" | "SELLER";
}

export interface OrderCreatedNotificationData {
  orderId: string; // Public id
  orderNumber: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  sourceType: "AUCTION" | "CATALOG_OFFER";
  sourceId: string; // Auction or offer public id
  sourceTitle: string; // Auction or catalog title
  buyerInfo: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  sellerInfo: {
    userId: string; // Internal id
    email: string;
    name: string;
  };
  recipientType: "BUYER" | "SELLER";
}

export interface UserWelcomeNotificationData {
  userEmail: string;
  userName: string;
  userType: "BUYER" | "SELLER" | "BUYER_AND_SELLER";
}

export interface NotificationMessage {
  eventType: NotificationEventType;
  notificationChannel: string; // ["EMAIL", "WEB", "SMS", "PUSH"]
  priority: NotificationPriority;
  entityType: NotificationEntityType;
  entityId: string; // ID of the entity
  userId: string; // Target user ID
  timestamp: string; // ISO timestamp
  data: any; // Event-specific data
}

export interface UserNotificationPreferences {
  userId: string;
  auctionCompleted: string[]; // ["EMAIL", "WEB"]
  bidPlaced: string[]; // ["WEB"]
  bidConfirmation: string[]; // ["EMAIL", "WEB"]
  outbid: string[]; // ["EMAIL", "WEB", "PUSH"]
  catalogOffer: string[]; // ["EMAIL", "WEB", "PUSH"]
  orderUpdates: string[]; // ["EMAIL", "SMS", "WEB"]
  urgentAlerts: string[]; // ["EMAIL", "SMS", "PUSH"]
  marketingUpdates: string[]; // ["EMAIL"]
}

export interface NotificationAttributes {
  [key: string]: {
    DataType: "String" | "Number";
    StringValue?: string;
    NumberValue?: string;
  };
}

export class UnifiedNotificationService {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(region?: string, topicArn?: string) {
    this.snsClient = new SNSClient({
      region: region || process.env.AWS_REGION,
    });
    this.topicArn = topicArn || process.env.NOTIFICATION_TOPIC_ARN || "";
  }

  /**
   * Send notifications across multiple channels based on user preferences
   */
  async sendMultiChannelNotification(
    baseMessage: Omit<NotificationMessage, "notificationChannel">,
    requestedChannels: string[],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Get user's preferred channels for this event type
    const allowedChannels = this.getUserAllowedChannels(
      baseMessage.eventType,
      requestedChannels,
      userPreferences
    );

    if (allowedChannels.length === 0) {
      console.log(
        `No allowed channels for user ${baseMessage.userId}, event ${baseMessage.eventType}`
      );
      return;
    }

    // Send separate message for each channel
    for (const channel of allowedChannels) {
      const channelMessage: NotificationMessage = {
        ...baseMessage,
        notificationChannel: channel, // Single channel per message for filtering
      };

      await this.sendSingleChannelNotification(channelMessage, channel);
    }
  }

  /**
   * Send notification to a single channel
   */
  private async sendSingleChannelNotification(
    message: NotificationMessage,
    channel: string
  ): Promise<void> {
    if (!this.topicArn) {
      throw new Error("NOTIFICATION_TOPIC_ARN is not configured");
    }

    const messageAttributes: NotificationAttributes = {
      eventType: { DataType: "String", StringValue: message.eventType },
      notificationChannel: {
        DataType: "String",
        StringValue: message.notificationChannel,
      },
      priority: { DataType: "String", StringValue: message.priority },
      entityType: { DataType: "String", StringValue: message.entityType },
      userId: { DataType: "String", StringValue: message.userId },
    };

    // Generate clean subject line without emojis or special characters
    const subject = this.generateChannelSpecificSubject(message, channel);
    const cleanSubject = this.sanitizeSubject(subject);

    const publishCommand = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(message),
      Subject: cleanSubject,
      MessageAttributes: messageAttributes,
    });

    try {
      await this.snsClient.send(publishCommand);
      console.log(
        `Notification sent: ${message.eventType} to user ${message.userId} via ${channel}`
      );
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
      // Don't throw - continue with other channels
    }
  }

  /**
   * Sanitize subject line for SNS compatibility
   * Removes emojis and special characters that SNS doesn't support
   */
  private sanitizeSubject(subject: string): string {
    if (!subject) {
      return "Notification";
    }

    // Remove emojis and other unicode symbols
    let cleaned = subject.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );

    // Remove other problematic characters but keep basic punctuation including apostrophes
    cleaned = cleaned.replace(/[^\w\s\-.,!?():']/g, "");

    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Ensure it's not empty
    if (!cleaned) {
      return "Notification";
    }

    // Ensure it's not too long (SNS has a 100 character limit for subjects)
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + "...";
    }

    return cleaned;
  }

  /**
   * Get user's allowed channels based on preferences and event type
   */
  private getUserAllowedChannels(
    eventType: NotificationEventType,
    requestedChannels: string[],
    userPreferences?: UserNotificationPreferences
  ): string[] {
    if (!userPreferences) {
      // If no preferences, allow all requested channels
      return requestedChannels;
    }

    // Map event types to preference fields
    const preferenceMap: Record<
      NotificationEventType,
      keyof UserNotificationPreferences
    > = {
      [NotificationEventType.AUCTION_COMPLETED]: "auctionCompleted",
      [NotificationEventType.BID_PLACED]: "bidPlaced",
      [NotificationEventType.BID_CONFIRMATION]: "bidConfirmation",
      [NotificationEventType.OUTBID]: "outbid",
      [NotificationEventType.CATALOG_OFFER_CREATED]: "catalogOffer",
      [NotificationEventType.CATALOG_OFFER_UPDATED]: "catalogOffer",
      [NotificationEventType.CATALOG_OFFER_ACCEPTED]: "catalogOffer",
      [NotificationEventType.ORDER_CREATED]: "orderUpdates",
      [NotificationEventType.ORDER_STATUS_UPDATED]: "orderUpdates",
      [NotificationEventType.ORDER_SHIPPED]: "orderUpdates",
      [NotificationEventType.PAYMENT_FAILED]: "urgentAlerts",
      [NotificationEventType.ACCOUNT_SECURITY]: "urgentAlerts",
      [NotificationEventType.URGENT_ALERT]: "urgentAlerts",
      [NotificationEventType.USER_WELCOME]: "urgentAlerts", // Welcome messages are important
    };

    const preferenceKey = preferenceMap[eventType];
    if (!preferenceKey || !userPreferences[preferenceKey]) {
      return requestedChannels; // Fallback to all requested
    }

    const userAllowedChannels = userPreferences[preferenceKey];

    // Return intersection of requested and user-allowed channels
    return requestedChannels.filter((channel) =>
      userAllowedChannels.includes(channel)
    );
  }

  /**
   * Send auction completion notification with multi-channel support
   */
  async sendAuctionWinnerNotification(
    data: {
      auctionId: string;
      auctionTitle: string;
      winnerId: string;
      winnerEmail: string;
      winnerName: string;
      finalBidAmount: number;
      currency: string;
      orderId: string;
      sellerInfo: any;
    },
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.AUCTION_COMPLETED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.AUCTION,
      entityId: data.auctionId,
      userId: data.winnerId,
      timestamp: new Date().toISOString(),
      data: {
        auctionTitle: data.auctionTitle,
        finalBidAmount: data.finalBidAmount,
        currency: data.currency,
        orderId: data.orderId,
        winnerInfo: {
          userId: data.winnerId,
          email: data.winnerEmail,
          name: data.winnerName,
        },
        sellerInfo: data.sellerInfo,
        recipientType: "WINNER",
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send auction completion notification to seller
   */
  async sendAuctionSellerNotification(
    data: {
      auctionId: string;
      auctionTitle: string;
      sellerId: string;
      sellerEmail: string;
      sellerName: string;
      hasWinner: boolean;
      finalBidAmount?: number;
      currency?: string;
      orderId?: string;
      winnerInfo?: any;
    },
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.AUCTION_COMPLETED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.AUCTION,
      entityId: data.auctionId,
      userId: data.sellerId,
      timestamp: new Date().toISOString(),
      data: {
        auctionTitle: data.auctionTitle,
        hasWinner: data.hasWinner,
        ...(data.hasWinner && {
          finalBidAmount: data.finalBidAmount,
          currency: data.currency,
          orderId: data.orderId,
          winnerInfo: data.winnerInfo,
        }),
        sellerInfo: {
          userId: data.sellerId,
          email: data.sellerEmail,
          name: data.sellerName,
        },
        recipientType: "SELLER",
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send bid placement notification with intelligent channel selection
   */
  async sendBidPlacedNotification(
    data: {
      auctionId: string;
      auctionTitle: string;
      sellerId: string;
      bidderId: string;
      bidderName: string;
      bidAmount: number;
      currency: string;
      currentHighBid: number;
      timeRemaining: number;
      auctionListingId?: string; // Internal ID for database lookups
    },
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Intelligent channel selection based on urgency
    let channels = ["WEB"]; // Default to web notification

    // Add email for high-value bids
    if (data.bidAmount >= 1000) {
      channels.push("EMAIL");
    }

    // Add push notification if auction ending soon
    if (data.timeRemaining < 300) {
      // Less than 5 minutes
      channels.push("PUSH");
    }

    const baseMessage = {
      eventType: NotificationEventType.BID_PLACED,
      priority:
        data.timeRemaining < 300
          ? NotificationPriority.HIGH
          : NotificationPriority.NORMAL,
      entityType: NotificationEntityType.AUCTION,
      entityId: data.auctionId,
      userId: data.sellerId,
      timestamp: new Date().toISOString(),
      data: {
        auctionTitle: data.auctionTitle,
        bidAmount: data.bidAmount,
        currency: data.currency,
        currentHighBid: data.currentHighBid,
        timeRemaining: data.timeRemaining,
        bidderId: data.bidderId,
        auctionListingId: data.auctionListingId, // Include internal ID for database lookups
        bidderInfo: {
          userId: data.bidderId,
          name: data.bidderName,
        },
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send bid confirmation notification to buyer
   */
  async sendBidConfirmationNotification(
    data: {
      auctionId: string;
      auctionTitle: string;
      bidderId: string;
      bidAmount: number;
      currency: string;
      currentHighBid: number;
      timeRemaining: number;
      isWinningBid: boolean;
      auctionListingId?: string; // Internal ID for database lookups
    },
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Send email confirmation for all bids, web notification for high-value or winning bids
    let channels = ["EMAIL"]; // Always send email confirmation

    // Add web notification for high-value bids or winning bids
    if (data.bidAmount >= 500 || data.isWinningBid) {
      channels.push("WEB");
    }

    // Add push notification if winning bid
    if (data.isWinningBid) {
      channels.push("PUSH");
    }

    const baseMessage = {
      eventType: NotificationEventType.BID_CONFIRMATION,
      priority: data.isWinningBid
        ? NotificationPriority.HIGH
        : NotificationPriority.NORMAL,
      entityType: NotificationEntityType.AUCTION,
      entityId: data.auctionId,
      userId: data.bidderId,
      timestamp: new Date().toISOString(),
      data: {
        auctionTitle: data.auctionTitle,
        bidAmount: data.bidAmount,
        currency: data.currency,
        currentHighBid: data.currentHighBid,
        timeRemaining: data.timeRemaining,
        isWinningBid: data.isWinningBid,
        bidderId: data.bidderId,
        auctionListingId: data.auctionListingId, // Include internal ID for database lookups
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send outbid notification to a user who has been outbid
   */
  async sendOutbidNotification(
    data: {
      auctionId: string;
      auctionTitle: string;
      outbidUserId: string;
      previousBidAmount: number;
      newHighBid: number;
      currency: string;
      timeRemaining: number;
      auctionListingId?: string; // Internal ID for database lookups
    },
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Outbid notifications are important - use email, web, and push
    let channels = ["EMAIL", "WEB"]; // Always send email and web notification

    // Add push notification for urgent cases (auction ending soon or high-value bids)
    if (data.timeRemaining < 3600 || data.newHighBid >= 1000) {
      // Less than 1 hour or high value
      channels.push("PUSH");
    }

    const baseMessage = {
      eventType: NotificationEventType.OUTBID,
      priority:
        data.timeRemaining < 3600
          ? NotificationPriority.HIGH
          : NotificationPriority.NORMAL,
      entityType: NotificationEntityType.AUCTION,
      entityId: data.auctionId,
      userId: data.outbidUserId,
      timestamp: new Date().toISOString(),
      data: {
        auctionTitle: data.auctionTitle,
        previousBidAmount: data.previousBidAmount,
        newHighBid: data.newHighBid,
        currency: data.currency,
        timeRemaining: data.timeRemaining,
        outbidUserId: data.outbidUserId,
        auctionListingId: data.auctionListingId, // Include internal ID for database lookups
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send catalog offer notification to seller
   */
  async sendCatalogOfferSellerNotification(
    data: {
      offerId: string;
      catalogId: string;
      catalogTitle: string;
      sellerId: string;
      buyerId: string;
      buyerEmail: string;
      buyerName: string;
      offerAmount: number;
      currency: string;
      itemCount: number;
      sellerInfo: {
        userId: string;
        email: string;
        name: string;
      };
    },
    channels: string[] = ["EMAIL", "WEB", "PUSH"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.CATALOG_OFFER_CREATED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.CATALOG_OFFER,
      entityId: data.offerId,
      userId: data.sellerId,
      timestamp: new Date().toISOString(),
      data: {
        offerId: data.offerId,
        catalogTitle: data.catalogTitle,
        catalogId: data.catalogId,
        offerAmount: data.offerAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        buyerInfo: {
          userId: data.buyerId,
          email: data.buyerEmail,
          name: data.buyerName,
        },
        sellerInfo: data.sellerInfo,
        recipientType: "SELLER",
      } as CatalogOfferNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send catalog offer confirmation notification to buyer
   */
  async sendCatalogOfferBuyerNotification(
    data: {
      offerId: string;
      catalogId: string;
      catalogTitle: string;
      buyerId: string;
      buyerEmail: string;
      buyerName: string;
      offerAmount: number;
      currency: string;
      itemCount: number;
      sellerInfo: {
        userId: string;
        email: string;
        name: string;
      };
    },
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.CATALOG_OFFER_CREATED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.CATALOG_OFFER,
      entityId: data.offerId,
      userId: data.buyerId,
      timestamp: new Date().toISOString(),
      data: {
        offerId: data.offerId,
        catalogTitle: data.catalogTitle,
        catalogId: data.catalogId,
        offerAmount: data.offerAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        buyerInfo: {
          userId: data.buyerId,
          email: data.buyerEmail,
          name: data.buyerName,
        },
        sellerInfo: data.sellerInfo,
        recipientType: "BUYER",
      } as CatalogOfferNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send catalog offer accepted notification to buyer
   */
  async sendCatalogOfferAcceptedBuyerNotification(
    data: {
      offerId: string;
      catalogId: string;
      catalogTitle: string;
      buyerId: string;
      buyerEmail: string;
      buyerName: string;
      finalOfferAmount: number;
      currency: string;
      itemCount: number;
      sellerInfo: {
        userId: string;
        email: string;
        name: string;
      };
      orderCreated?: boolean;
      orderId?: string;
      orderNumber?: string;
      sellerMessage?: string;
    },
    channels: string[] = ["EMAIL", "WEB", "PUSH"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.CATALOG_OFFER_ACCEPTED,
      priority: NotificationPriority.HIGH,
      entityType: NotificationEntityType.CATALOG_OFFER,
      entityId: data.offerId,
      userId: data.buyerId,
      timestamp: new Date().toISOString(),
      data: {
        offerId: data.offerId,
        catalogTitle: data.catalogTitle,
        catalogId: data.catalogId,
        finalOfferAmount: data.finalOfferAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        buyerInfo: {
          userId: data.buyerId,
          email: data.buyerEmail,
          name: data.buyerName,
        },
        sellerInfo: data.sellerInfo,
        orderCreated: data.orderCreated,
        orderId: data.orderId,
        sellerMessage: data.sellerMessage,
        recipientType: "BUYER",
      } as CatalogOfferAcceptedNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send catalog offer accepted notification to seller
   */
  async sendCatalogOfferAcceptedSellerNotification(
    data: {
      offerId: string;
      catalogId: string;
      catalogTitle: string;
      sellerId: string;
      sellerEmail: string;
      sellerName: string;
      finalOfferAmount: number;
      currency: string;
      itemCount: number;
      buyerInfo: {
        userId: string;
        email: string;
        name: string;
      };
      orderCreated?: boolean;
      orderId?: string;
      orderNumber?: string;
      sellerMessage?: string;
    },
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.CATALOG_OFFER_ACCEPTED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.CATALOG_OFFER,
      entityId: data.offerId,
      userId: data.sellerId,
      timestamp: new Date().toISOString(),
      data: {
        offerId: data.offerId,
        catalogTitle: data.catalogTitle,
        catalogId: data.catalogId,
        finalOfferAmount: data.finalOfferAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        buyerInfo: data.buyerInfo,
        sellerInfo: {
          userId: data.sellerId,
          email: data.sellerEmail,
          name: data.sellerName,
        },
        orderCreated: data.orderCreated,
        orderId: data.orderId,
        sellerMessage: data.sellerMessage,
        recipientType: "SELLER",
      } as CatalogOfferAcceptedNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send order created notification to buyer
   */
  async sendOrderCreatedBuyerNotification(
    data: {
      orderId: string;
      orderNumber: string;
      buyerId: string;
      buyerEmail: string;
      buyerName: string;
      totalAmount: number;
      currency: string;
      itemCount: number;
      sourceType: "AUCTION" | "CATALOG_OFFER";
      sourceId: string;
      sourceTitle: string;
      sellerInfo: {
        userId: string;
        email: string;
        name: string;
      };
    },
    channels: string[] = ["EMAIL", "WEB", "PUSH"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.ORDER_CREATED,
      priority: NotificationPriority.HIGH,
      entityType: NotificationEntityType.ORDER,
      entityId: data.orderId,
      userId: data.buyerId,
      timestamp: new Date().toISOString(),
      data: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceTitle: data.sourceTitle,
        buyerInfo: {
          userId: data.buyerId,
          email: data.buyerEmail,
          name: data.buyerName,
        },
        sellerInfo: data.sellerInfo,
        recipientType: "BUYER",
      } as OrderCreatedNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send order created notification to seller
   */
  async sendOrderCreatedSellerNotification(
    data: {
      orderId: string;
      orderNumber: string;
      sellerId: string;
      sellerEmail: string;
      sellerName: string;
      totalAmount: number;
      currency: string;
      itemCount: number;
      sourceType: "AUCTION" | "CATALOG_OFFER";
      sourceId: string;
      sourceTitle: string;
      buyerInfo: {
        userId: string;
        email: string;
        name: string;
      };
    },
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.ORDER_CREATED,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.ORDER,
      entityId: data.orderId,
      userId: data.sellerId,
      timestamp: new Date().toISOString(),
      data: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        currency: data.currency,
        itemCount: data.itemCount,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceTitle: data.sourceTitle,
        buyerInfo: data.buyerInfo,
        sellerInfo: {
          userId: data.sellerId,
          email: data.sellerEmail,
          name: data.sellerName,
        },
        recipientType: "SELLER",
      } as OrderCreatedNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send order status update with context-aware channels
   */
  async sendOrderStatusNotification(
    data: {
      orderId: string;
      orderNumber: string;
      buyerId: string;
      sellerId: string;
      newStatus: string;
      previousStatus: string;
      totalAmount: number;
      currency: string;
    },
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Context-aware channel selection
    let channels = ["EMAIL", "WEB"];
    let priority = NotificationPriority.NORMAL;

    // Add SMS for critical status changes
    if (
      ["SHIPPED", "DELIVERED", "CANCELLED", "PAYMENT_FAILED"].includes(
        data.newStatus
      )
    ) {
      channels.push("SMS");
      priority = NotificationPriority.HIGH;
    }

    // Add push for real-time updates
    if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(data.newStatus)) {
      channels.push("PUSH");
    }

    // Send to buyer
    const buyerMessage = {
      eventType: NotificationEventType.ORDER_STATUS_UPDATED,
      priority,
      entityType: NotificationEntityType.ORDER,
      entityId: data.orderId,
      userId: data.buyerId,
      timestamp: new Date().toISOString(),
      data: {
        orderNumber: data.orderNumber,
        newStatus: data.newStatus,
        previousStatus: data.previousStatus,
        totalAmount: data.totalAmount,
        currency: data.currency,
        recipientType: "BUYER",
      },
    };

    await this.sendMultiChannelNotification(
      buyerMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send urgent alert with all available channels
   */
  async sendUrgentAlert(
    data: {
      userId: string;
      alertType: string;
      title: string;
      message: string;
      entityType: NotificationEntityType;
      entityId: string;
    },
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    // Use all channels for urgent alerts
    const channels = ["EMAIL", "WEB", "SMS", "PUSH"];

    const baseMessage = {
      eventType: NotificationEventType.URGENT_ALERT,
      priority: NotificationPriority.URGENT,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      timestamp: new Date().toISOString(),
      data: {
        alertType: data.alertType,
        title: data.title,
        message: data.message,
      },
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Send welcome notification to new users
   */
  async sendUserWelcomeNotification(
    data: {
      userId: string;
    } & UserWelcomeNotificationData,
    channels: string[] = ["EMAIL", "WEB"],
    userPreferences?: UserNotificationPreferences
  ): Promise<void> {
    const baseMessage = {
      eventType: NotificationEventType.USER_WELCOME,
      priority: NotificationPriority.NORMAL,
      entityType: NotificationEntityType.USER,
      entityId: data.userId,
      userId: data.userId,
      timestamp: new Date().toISOString(),
      data: {
        userEmail: data.userEmail,
        userName: data.userName,
        userType: data.userType,
      } as UserWelcomeNotificationData,
    };

    await this.sendMultiChannelNotification(
      baseMessage,
      channels,
      userPreferences
    );
  }

  /**
   * Generate channel-specific subject lines (cleaned for SNS compatibility)
   */
  private generateChannelSpecificSubject(
    message: NotificationMessage,
    channel: string
  ): string {
    const data = message.data;

    switch (channel) {
      case "EMAIL":
        return this.getEmailSubject(message.eventType, data);
      case "SMS":
        return this.getSMSSubject(message.eventType, data);
      case "PUSH":
        return this.getPushSubject(message.eventType, data);
      case "WEB":
        return this.getWebSubject(message.eventType, data);
      default:
        return `${message.eventType} Notification`;
    }
  }

  private getEmailSubject(eventType: NotificationEventType, data: any): string {
    switch (eventType) {
      case NotificationEventType.AUCTION_COMPLETED:
        if (data.recipientType === "WINNER") {
          return `Congratulations! You won: ${data.auctionTitle}`;
        }
        return data.hasWinner
          ? `Your auction sold: ${data.auctionTitle}`
          : `Auction ended: ${data.auctionTitle}`;
      case NotificationEventType.BID_PLACED:
        return `New bid on your auction: ${data.auctionTitle}`;
      case NotificationEventType.BID_CONFIRMATION:
        return data.isWinningBid
          ? `You're winning the auction: ${data.auctionTitle}`
          : `Bid confirmed for: ${data.auctionTitle}`;
      case NotificationEventType.OUTBID:
        return `You've been outbid on: ${data.auctionTitle}. New high bid: ${data.currency} ${data.newHighBid.toLocaleString()}`;
      case NotificationEventType.CATALOG_OFFER_CREATED:
        if ((data as CatalogOfferNotificationData).recipientType === "BUYER") {
          return `Offer submitted successfully: ${data.catalogTitle} - ${(data as CatalogOfferNotificationData).offerId}`;
        }
        return `New offer on your catalog: ${data.catalogTitle} - ${(data as CatalogOfferNotificationData).offerId}`;
      case NotificationEventType.CATALOG_OFFER_ACCEPTED:
        if (
          (data as CatalogOfferAcceptedNotificationData).recipientType ===
          "BUYER"
        ) {
          return `Great news! Your offer was accepted: ${data.catalogTitle}`;
        }
        return `Offer accepted confirmation: ${data.catalogTitle}`;
      case NotificationEventType.ORDER_CREATED:
        if ((data as OrderCreatedNotificationData).recipientType === "BUYER") {
          return `Order created: ${data.orderNumber} - ${data.sourceTitle}`;
        }
        return `New order received: ${data.orderNumber} - ${data.sourceTitle}`;
      case NotificationEventType.USER_WELCOME:
        return `Welcome to Commerce Central, ${data.userName}!`;
      default:
        return `Notification: ${eventType}`;
    }
  }

  private getSMSSubject(eventType: NotificationEventType, data: any): string {
    // SMS subjects should be shorter
    switch (eventType) {
      case NotificationEventType.AUCTION_COMPLETED:
        return data.recipientType === "WINNER"
          ? "Auction Won!"
          : "Auction Update";
      case NotificationEventType.BID_PLACED:
        return "New Bid";
      case NotificationEventType.BID_CONFIRMATION:
        return data.isWinningBid ? "You're Winning!" : "Bid Confirmed";
      case NotificationEventType.OUTBID:
        return "Outbid Alert";
      case NotificationEventType.ORDER_STATUS_UPDATED:
        return "Order Update";
      case NotificationEventType.USER_WELCOME:
        return "Welcome!";
      default:
        return "Alert";
    }
  }

  private getPushSubject(eventType: NotificationEventType, data: any): string {
    // Push notification titles should be concise
    switch (eventType) {
      case NotificationEventType.AUCTION_COMPLETED:
        return data.recipientType === "WINNER" ? "You Won!" : "Auction Sold";
      case NotificationEventType.BID_PLACED:
        return "New Bid";
      case NotificationEventType.BID_CONFIRMATION:
        return data.isWinningBid ? "You're Winning!" : "Bid Confirmed";
      case NotificationEventType.OUTBID:
        return "Outbid Alert";
      case NotificationEventType.CATALOG_OFFER_CREATED:
        return "New Offer";
      case NotificationEventType.CATALOG_OFFER_ACCEPTED:
        return data.recipientType === "BUYER"
          ? "Offer Accepted!"
          : "Offer Accepted";
      case NotificationEventType.ORDER_CREATED:
        return data.recipientType === "BUYER" ? "Order Created" : "New Order";
      case NotificationEventType.USER_WELCOME:
        return "Welcome!";
      default:
        return "Notification";
    }
  }

  private getWebSubject(eventType: NotificationEventType, data: any): string {
    // Web notifications can be more descriptive
    return this.getEmailSubject(eventType, data);
  }
}

// Export singleton instance
export const notificationService = new UnifiedNotificationService();

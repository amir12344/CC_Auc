import {
  NotificationMessage,
  OrderCreatedNotificationData,
} from "../../commons/utilities/UnifiedNotificationService";
import { EMAIL_FOOTER, EMAIL_HERO, EMAIL_STYLES } from "./EmailConstants";

// Main HTML template with placeholders for content
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    ${EMAIL_STYLES}
</head>
<body>
    <div class="email-container">
        
        ${EMAIL_HERO}
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="title">{{MAIN_HEADING}}</h1>
            
            <p class="greeting">{{GREETING}}</p>
            
            <p class="message">
                {{MAIN_MESSAGE}}
            </p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="margin-top: 0; color: #1976d2;">Order Details</h3>
                <p><strong>Order Number:</strong> {{ORDER_NUMBER}}</p>
                <!-- <p><strong>Order ID:</strong> {{ORDER_ID}}</p> -->
                <p><strong>Total Amount:</strong> {{TOTAL_AMOUNT}}</p>
                <p><strong>Items:</strong> {{ITEM_COUNT}}</p>
                <p><strong>Source:</strong> {{SOURCE_TITLE}} ({{SOURCE_TYPE}})</p>
            </div>
            
            <!-- {{COUNTERPART_INFO}} -->
            
            <div class="offer-details">
                <h3>Next Steps:</h3>
                {{NEXT_STEPS}}
            </div>
            
            <!-- {{CTA_SECTION}} -->
        </div>
        
        ${EMAIL_FOOTER}
    </div>
</body>
</html>`;

function substituteTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let processedTemplate = template;

  // Replace template variables with format {{VARIABLE_NAME}}
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    processedTemplate = processedTemplate.replace(
      new RegExp(placeholder, "g"),
      value
    );
  });

  return processedTemplate;
}

export function getOrderCreatedEmailTemplate(message: NotificationMessage): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data as OrderCreatedNotificationData;

  // Check if this is for seller or buyer
  if (data.recipientType === "BUYER") {
    const variables = {
      TITLE: "Order Created Successfully - Commerce Central",
      MAIN_HEADING: "📦 Your Order Has Been Created!",
      GREETING: `Dear ${data.buyerInfo?.name || "Buyer"},`,
      MAIN_MESSAGE: `Great news! Your order has been successfully created from your ${data.sourceType === "AUCTION" ? "auction win" : "accepted catalog offer"}.`,
      ORDER_NUMBER: data.orderNumber || "",
      // ORDER_ID: data.orderId || "",
      TOTAL_AMOUNT: `${data.currency} ${data.totalAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      SOURCE_TITLE: data.sourceTitle || "",
      SOURCE_TYPE:
        data.sourceType === "AUCTION" ? "Auction Win" : "Catalog Offer",
      // COUNTERPART_INFO: `
      //   <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
      //     <h4 style="margin-top: 0;">Seller Information:</h4>
      //     <p><strong>Seller:</strong> ${data.sellerInfo?.name || "Seller"}</p>
      //     <p><strong>Email:</strong> ${data.sellerInfo?.email || ""}</p>
      //   </div>`,
      NEXT_STEPS: `
        <ol>
          <li><strong>Payment:</strong> You will receive payment instructions within the next few minutes. Please complete payment within 48 hours.</li>
          <li><strong>Shipping:</strong> Provide your shipping address if not already provided.</li>
          <li><strong>Tracking:</strong> You'll receive tracking information once your order ships.</li>
          <li><strong>Support:</strong> Contact our support team if you have any questions.</li>
        </ol>`,
      // CTA_SECTION: `<a href="#" class="cta-button">View Order Details</a>`,
    };

    return {
      recipientEmail: data.buyerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  } else {
    // Seller notification email
    const variables = {
      TITLE: "New Order Received - Commerce Central",
      MAIN_HEADING: "💼 New Order Received!",
      GREETING: `Dear ${data.sellerInfo?.name || "Seller"},`,
      MAIN_MESSAGE: `You have received a new order from your ${data.sourceType === "AUCTION" ? "auction sale" : "catalog listing"}.`,
      ORDER_NUMBER: data.orderNumber || "",
      // ORDER_ID: data.orderId || "",
      TOTAL_AMOUNT: `${data.currency} ${data.totalAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      SOURCE_TITLE: data.sourceTitle || "",
      SOURCE_TYPE:
        data.sourceType === "AUCTION" ? "Auction Sale" : "Catalog Offer",
      // COUNTERPART_INFO: `
      //   <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
      //     <h4 style="margin-top: 0;">Buyer Information:</h4>
      //     <p><strong>Buyer:</strong> ${data.buyerInfo?.name || "Buyer"}</p>
      //     <p><strong>Email:</strong> ${data.buyerInfo?.email || ""}</p>
      //   </div>`,
      NEXT_STEPS: `
        <ol>
          <li><strong>Payment Processing:</strong> Wait for the buyer to complete payment (they have 48 hours).</li>
          <li><strong>Order Preparation:</strong> Begin preparing the items for shipment.</li>
          <li><strong>Shipping:</strong> Once payment is confirmed, ship the order and provide tracking information.</li>
          <li><strong>Updates:</strong> Keep the buyer informed of the order status through our platform.</li>
        </ol>`,
      // CTA_SECTION: `<a href="#" class="cta-button">Manage Order</a>`,
    };

    return {
      recipientEmail: data.sellerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  }
}

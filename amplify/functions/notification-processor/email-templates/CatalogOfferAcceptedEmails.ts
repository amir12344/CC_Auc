import {
  CatalogOfferAcceptedNotificationData,
  NotificationMessage,
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
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4CAF50;">{{CATALOG_TITLE}}</h3>
                <p><strong>Offer ID:</strong> {{OFFER_ID}}</p>
                <p><strong>Final Amount:</strong> {{FINAL_AMOUNT}}</p>
                <p><strong>Items:</strong> {{ITEM_COUNT}}</p>
                {{SELLER_MESSAGE_SECTION}}
                {{ORDER_SECTION}}
            </div>
            
            <div class="offer-details">
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

export function getCatalogOfferAcceptedEmailTemplate(
  message: NotificationMessage
): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data as CatalogOfferAcceptedNotificationData;

  // Check if this is for seller or buyer
  if (data.recipientType === "BUYER") {
    const variables = {
      TITLE: "Great News! Your Offer Was Accepted - Commerce Central",
      MAIN_HEADING: "🎉 Your Offer Was Accepted!",
      GREETING: `Dear ${data.buyerInfo?.name || "Buyer"},`,
      MAIN_MESSAGE:
        "Excellent news! Your offer has been accepted by the seller.",
      CATALOG_TITLE: data.catalogTitle || "Catalog Listing",
      OFFER_ID: data.offerId || "",
      FINAL_AMOUNT: `${data.currency} ${data.finalOfferAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      SELLER_MESSAGE_SECTION: data.sellerMessage
        ? `<p><strong>Message from Seller:</strong></p><p style="font-style: italic; color: #666; margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #4CAF50;">${data.sellerMessage}</p>`
        : "",
      ORDER_SECTION:
        data.orderCreated && data.orderNumber
          ? `<p><strong>Order Created:</strong> ${data.orderNumber}</p>`
          : "",
      NEXT_STEPS: data.orderCreated
        ? "Your order has been automatically created. You will receive payment instructions shortly. Please complete payment within 48 hours to secure your items."
        : "The seller will now process your request and create an order. You'll receive further instructions for payment and shipping soon.",
      // CTA_SECTION: `<a href="#" class="cta-button">View Your ${data.orderCreated ? "Order" : "Offer"} Status</a>`,
    };

    return {
      recipientEmail: data.buyerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  } else {
    // Seller confirmation email
    const variables = {
      TITLE: "Offer Acceptance Confirmed - Commerce Central",
      MAIN_HEADING: "✅ Offer Acceptance Confirmed",
      GREETING: `Dear ${data.sellerInfo?.name || "Seller"},`,
      MAIN_MESSAGE: "This confirms that you have accepted the buyer's offer.",
      CATALOG_TITLE: data.catalogTitle || "Catalog Listing",
      OFFER_ID: data.offerId || "",
      FINAL_AMOUNT: `${data.currency} ${data.finalOfferAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      SELLER_MESSAGE_SECTION: data.sellerMessage
        ? `<p><strong>Your message to buyer:</strong></p><p style="font-style: italic; color: #666; margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #4CAF50;">${data.sellerMessage}</p>`
        : "",
      ORDER_SECTION:
        data.orderCreated && data.orderNumber
          ? `<p><strong>Order Created:</strong> ${data.orderNumber}</p>`
          : "",
      NEXT_STEPS: data.orderCreated
        ? "An order has been automatically created. The buyer will receive payment instructions. Once payment is completed, prepare your items for shipment."
        : "You can now create an order for this accepted offer. The buyer is waiting for further instructions.",
      // CTA_SECTION: `<a href="#" class="cta-button">${data.orderCreated ? "Manage Order" : "Create Order"}</a>`,
    };

    return {
      recipientEmail: data.sellerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  }
}

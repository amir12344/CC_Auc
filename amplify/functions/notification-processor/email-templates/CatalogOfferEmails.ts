import {
  CatalogOfferNotificationData,
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
                {{MAIN_MESSAGE}} <a href="#" class="offer-link">{{CATALOG_TITLE}}</a>
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{{CATALOG_TITLE}}</h3>
                <p><strong>Offer ID:</strong> {{OFFER_ID}}</p>
                <p><strong>Offer Amount:</strong> {{OFFER_AMOUNT}}</p>
                <p><strong>Items:</strong> {{ITEM_COUNT}}</p>
                <!-- <p><strong>From:</strong> {{BUYER_NAME}}</p> -->
            </div>
            
            <!-- Quote section - commented out
            <p class="quote">
                {{QUOTE_TEXT}} — {{QUOTE_AUTHOR}}
            </p>
            -->
            
            <p class="offer-details">
                {{OFFER_DETAILS_TEXT}}
            </p>
            
            <!-- CTA Button section - commented out
            <a href="{{CTA_LINK}}" class="cta-button">{{CTA_TEXT}}</a>
            -->
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

export function getCatalogOfferEmailTemplate(message: NotificationMessage): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data as CatalogOfferNotificationData;

  // Check if this is for seller or buyer
  if (data.recipientType === "SELLER") {
    const variables = {
      TITLE: "New Offer on Your Catalog - Commerce Central",
      MAIN_HEADING: "New Offer on Your Catalog!",
      GREETING: `Dear ${data.sellerInfo?.name || "Seller"},`,
      MAIN_MESSAGE: "You have received a new offer on your catalog listing:",
      CATALOG_TITLE: data.catalogTitle || "Catalog Listing",
      OFFER_ID: data.offerId || "",
      OFFER_AMOUNT: `${data.currency} ${data.offerAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      BUYER_NAME: data.buyerInfo?.name || "Buyer",
      BUYER_EMAIL: data.buyerInfo?.email || "",
      QUOTE_TEXT: `"New offer of ${data.currency} ${data.offerAmount?.toLocaleString() || "0"} received from ${data.buyerInfo?.name || "a buyer"}."`,
      QUOTE_AUTHOR: data.buyerInfo?.name || "Buyer",
      // CTA_TEXT: "View Offer Details",
      // CTA_LINK: "#", // This should be replaced with actual dashboard link
      OFFER_DETAILS_TEXT:
        "View your offer for more detailed information. Feel free to reach out to your Account Manager with any questions.",
    };

    return {
      recipientEmail: data.sellerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  } else {
    // Buyer confirmation email
    const variables = {
      TITLE: "Offer Submitted Successfully - Commerce Central",
      MAIN_HEADING: "Offer Submitted Successfully!",
      GREETING: `Dear ${data.buyerInfo?.name || "Buyer"},`,
      MAIN_MESSAGE: "Your offer has been successfully submitted:",
      CATALOG_TITLE: data.catalogTitle || "Catalog Listing",
      OFFER_ID: data.offerId || "",
      OFFER_AMOUNT: `${data.currency} ${data.offerAmount?.toLocaleString() || "0"}`,
      ITEM_COUNT: `${data.itemCount || 0} item(s)`,
      BUYER_NAME: data.buyerInfo?.name || "Buyer",
      BUYER_EMAIL: data.buyerInfo?.email || "",
      QUOTE_TEXT: `"Your offer of ${data.currency} ${data.offerAmount?.toLocaleString() || "0"} has been submitted and the seller will be notified."`,
      QUOTE_AUTHOR: "Commerce Central",
      // CTA_TEXT: "Track Your Offer",
      // CTA_LINK: "#", // This should be replaced with actual dashboard link
      OFFER_DETAILS_TEXT:
        "Track your offer status in your buyer dashboard. You'll receive an email when the seller responds.",
    };

    return {
      recipientEmail: data.buyerInfo?.email || "",
      emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
    };
  }
}

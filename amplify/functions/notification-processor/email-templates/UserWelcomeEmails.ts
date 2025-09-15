import {
  NotificationMessage,
  UserWelcomeNotificationData,
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
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <h3 style="margin-top: 0; color: #4CAF50;">Your Account Details</h3>
                <p><strong>Name:</strong> {{USER_NAME}}</p>
                <p><strong>Email:</strong> {{USER_EMAIL}}</p>
                <p><strong>Account Type:</strong> {{USER_TYPE}}</p>
            </div>
            
            {{BUYER_FEATURES}}
            
            {{SELLER_FEATURES}}
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h4 style="margin-top: 0; color: #ff9800;">🚀 Getting Started</h4>
                <ol>
                    <li>Complete your profile to build trust with other users</li>
                    <li>Browse our categories to discover opportunities</li>
                    <li>Set up your notification preferences</li>
                    <li>Start connecting with potential business partners</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p>Ready to start your Commerce Central journey?</p>
                {{CTA_SECTION}}
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Need Help?</h4>
                <p>Our support team is here to assist you:</p>
                <ul>
                    <li>📧 Email: team@commercecentral.ai</li>
                </ul>
            </div>
            
            <p class="message">{{CLOSING_MESSAGE}}</p>
            
            <p class="message">{{SIGNATURE}}</p>
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

export function getUserWelcomeEmailTemplate(message: NotificationMessage): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data as UserWelcomeNotificationData;

  // Generate buyer features section if user is a buyer
  const buyerFeatures =
    data.userType === "BUYER" || data.userType === "BUYER_AND_SELLER"
      ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
      <h4 style="margin-top: 0; color: #2196f3;">As a Buyer, you can:</h4>
      <ul>
        <li>Browse thousands of products across categories</li>
        <li>Participate in live auctions</li>
        <li>Make direct offers on catalog items</li>
        <li>Track your orders and shipments</li>
      </ul>
    </div>
  `
      : "";

  // Generate seller features section if user is a seller
  const sellerFeatures =
    data.userType === "SELLER" || data.userType === "BUYER_AND_SELLER"
      ? `
    <div style="background: #f1f8e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
      <h4 style="margin-top: 0; color: #4CAF50;">As a Seller, you can:</h4>
      <ul>
        <li>List products in our marketplace catalog</li>
        <li>Create time-limited auctions</li>
        <li>Manage offers and negotiations</li>
        <li>Track sales and fulfill orders</li>
      </ul>
    </div>
  `
      : "";

  const variables = {
    TITLE: "Welcome to Commerce Central!",
    MAIN_HEADING: "🎉 Welcome to Commerce Central!",
    GREETING: `Dear ${data.userName},`,
    MAIN_MESSAGE:
      "Welcome to Commerce Central, the premier B2B marketplace connecting buyers and sellers across industries!",
    USER_NAME: data.userName || "",
    USER_EMAIL: data.userEmail || "",
    USER_TYPE: (data.userType || "").replace("_", " & "),
    BUYER_FEATURES: buyerFeatures,
    SELLER_FEATURES: sellerFeatures,
    CTA_SECTION: `<a href="#" class="cta-button">Explore the Platform</a>`,
    CLOSING_MESSAGE:
      "Thank you for joining Commerce Central. We're excited to be part of your business growth!",
    SIGNATURE: "Best regards,<br>The Commerce Central Team",
  };

  return {
    recipientEmail: data.userEmail,
    emailTemplate: substituteTemplateVariables(HTML_TEMPLATE, variables),
  };
}

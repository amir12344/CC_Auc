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
            
            <!-- Bid Details Box -->
            <div class="details-box">
                <h3 class="details-title">{{AUCTION_TITLE}}</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">New Bid:</span>
                        <span class="detail-value">{{NEW_BID_AMOUNT}}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Current High Bid:</span>
                        <span class="detail-value">{{CURRENT_HIGH_BID}}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time Remaining:</span>
                        <span class="detail-value">{{TIME_REMAINING}}</span>
                    </div>
                </div>
            </div>
            
            <p class="closing-message">
                {{CLOSING_MESSAGE}}
            </p>
        </div>
        
        ${EMAIL_FOOTER}
    </div>
</body>
</html>`;

export interface BidPlacedEmailData {
  sellerName: string;
  sellerEmail: string;
  auctionTitle: string;
  bidderName: string;
  bidAmount: number;
  currency: string;
  currentHighBid: number;
  timeRemaining: number;
}

export interface BuyerBidConfirmationEmailData {
  buyerName: string;
  buyerEmail: string;
  auctionTitle: string;
  bidAmount: number;
  currency: string;
  currentHighBid: number;
  timeRemaining: number;
  isWinningBid: boolean;
}

export interface OutbidEmailData {
  buyerName: string;
  buyerEmail: string;
  auctionTitle: string;
  previousBidAmount: number;
  newHighBid: number;
  currency: string;
  timeRemaining: number;
}

/**
 * Generate bid placed email template for seller notification
 */
export function getBidPlacedEmailTemplate(emailData: BidPlacedEmailData): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const timeRemainingMinutes = Math.round(emailData.timeRemaining / 60);
  const timeRemainingText =
    timeRemainingMinutes > 0
      ? `${timeRemainingMinutes} minutes`
      : "Less than 1 minute";

  const emailTemplate = HTML_TEMPLATE.replace(
    "{{TITLE}}",
    "New Bid on Your Auction"
  )
    .replace("{{MAIN_HEADING}}", "💰 New Bid on Your Auction!")
    .replace("{{GREETING}}", `Dear ${emailData.sellerName},`)
    .replace(
      "{{MAIN_MESSAGE}}",
      `Great news! ${emailData.bidderName} just placed a bid on your auction:`
    )
    .replace("{{AUCTION_TITLE}}", emailData.auctionTitle)
    .replace(
      "{{NEW_BID_AMOUNT}}",
      `${emailData.currency} ${emailData.bidAmount.toLocaleString()}`
    )
    .replace(
      "{{CURRENT_HIGH_BID}}",
      `${emailData.currency} ${emailData.currentHighBid.toLocaleString()}`
    )
    .replace("{{TIME_REMAINING}}", timeRemainingText)
    .replace(
      "{{CLOSING_MESSAGE}}",
      "Keep an eye on your auction as it approaches the end time!"
    );

  return {
    emailTemplate,
    recipientEmail: emailData.sellerEmail,
  };
}

/**
 * Generate bid confirmation email template for buyer notification
 */
export function getBuyerBidConfirmationEmailTemplate(
  emailData: BuyerBidConfirmationEmailData
): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const timeRemainingMinutes = Math.round(emailData.timeRemaining / 60);
  const timeRemainingText =
    timeRemainingMinutes > 0
      ? `${timeRemainingMinutes} minutes`
      : "Less than 1 minute";

  const statusMessage = emailData.isWinningBid
    ? "🎉 Congratulations! You are currently the highest bidder."
    : "Your bid has been placed successfully. Keep an eye on the auction as other bidders may place higher bids.";

  const emailTemplate = HTML_TEMPLATE.replace("{{TITLE}}", "Bid Confirmation")
    .replace(
      "{{MAIN_HEADING}}",
      emailData.isWinningBid
        ? "🎉 You're Winning!"
        : "✅ Bid Placed Successfully"
    )
    .replace("{{GREETING}}", `Dear ${emailData.buyerName},`)
    .replace("{{MAIN_MESSAGE}}", statusMessage)
    .replace("{{AUCTION_TITLE}}", emailData.auctionTitle)
    .replace(
      "{{NEW_BID_AMOUNT}}",
      `${emailData.currency} ${emailData.bidAmount.toLocaleString()}`
    )
    .replace(
      "{{CURRENT_HIGH_BID}}",
      `${emailData.currency} ${emailData.currentHighBid.toLocaleString()}`
    )
    .replace("{{TIME_REMAINING}}", timeRemainingText)
    .replace(
      "{{CLOSING_MESSAGE}}",
      "We'll notify you if you're outbid or when the auction ends. Good luck!"
    );

  return {
    emailTemplate,
    recipientEmail: emailData.buyerEmail,
  };
}

/**
 * Generate outbid notification email template
 */
export function getOutbidEmailTemplate(emailData: OutbidEmailData): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const timeRemainingMinutes = Math.round(emailData.timeRemaining / 60);
  const timeRemainingText =
    timeRemainingMinutes > 0
      ? `${timeRemainingMinutes} minutes`
      : "Less than 1 minute";

  const emailTemplate = HTML_TEMPLATE.replace("{{TITLE}}", "You've Been Outbid")
    .replace("{{MAIN_HEADING}}", "📈 You've Been Outbid!")
    .replace("{{GREETING}}", `Dear ${emailData.buyerName},`)
    .replace(
      "{{MAIN_MESSAGE}}",
      "Unfortunately, another bidder has placed a higher bid on the auction you were interested in:"
    )
    .replace("{{AUCTION_TITLE}}", emailData.auctionTitle)
    .replace(
      "{{NEW_BID_AMOUNT}}",
      `${emailData.currency} ${emailData.previousBidAmount.toLocaleString()} (Your Previous Bid)`
    )
    .replace(
      "{{CURRENT_HIGH_BID}}",
      `${emailData.currency} ${emailData.newHighBid.toLocaleString()} (New High Bid)`
    )
    .replace("{{TIME_REMAINING}}", timeRemainingText)
    .replace(
      "{{CLOSING_MESSAGE}}",
      "Don't miss out! You can still place a higher bid before the auction ends."
    );

  return {
    emailTemplate,
    recipientEmail: emailData.buyerEmail,
  };
}

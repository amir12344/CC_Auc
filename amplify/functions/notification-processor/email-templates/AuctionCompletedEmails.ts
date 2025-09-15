import { NotificationMessage } from "../../commons/utilities/UnifiedNotificationService";
import { EMAIL_FOOTER, EMAIL_HERO, EMAIL_STYLES } from "./EmailConstants";

export function getAuctionCompletedEmailTemplate(
  message: NotificationMessage
): {
  emailTemplate: string;
  recipientEmail: string;
} {
  const data = message.data;

  if (data.winnerInfo && data.winnerInfo.userId === message.userId) {
    // Winner email template
    return {
      recipientEmail: data.winnerInfo.email,
      emailTemplate: getWinnerEmailTemplate(data),
    };
  } else {
    // Seller email template
    return {
      recipientEmail: data.sellerInfo.email,
      emailTemplate: data.hasWinner
        ? getSellerSoldEmailTemplate(data)
        : getSellerNoSaleEmailTemplate(data),
    };
  }
}

function getWinnerEmailTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Congratulations! You Won the Auction</title>
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="email-container">
        ${EMAIL_HERO}
        
        <div class="content">
          <h1 class="title">🎉 Congratulations! You Won!</h1>
          
          <p class="greeting">Dear ${data.winnerInfo.name},</p>
          
          <p class="message">Great news! You have successfully won the auction for:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #333;">${data.auctionTitle}</h3>
            <p style="margin: 10px 0;"><strong>Winning Bid:</strong> ${data.currency} ${data.finalBidAmount.toLocaleString()}</p>
            <p style="margin: 10px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 20px 0;">Next Steps:</h3>
          <ol style="color: #666; padding-left: 20px; line-height: 1.8;">
            <li>You will receive a separate email with payment instructions</li>
            <li>Please complete payment within 48 hours</li>
            <li>Provide shipping information for your order</li>
          </ol>
          
          <p class="message">Thank you for using our platform!</p>
        </div>
        
        ${EMAIL_FOOTER}
      </div>
    </body>
    </html>
  `;
}

function getSellerSoldEmailTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Auction Has Sold!</title>
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="email-container">
        ${EMAIL_HERO}
        
        <div class="content">
          <h1 class="title">🎯 Your Auction Sold!</h1>
          
          <p class="greeting">Dear ${data.sellerInfo.name},</p>
          
          <p class="message">Excellent news! Your auction has ended successfully with a winning bid:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #333;">${data.auctionTitle}</h3>
            <p style="margin: 10px 0;"><strong>Final Bid:</strong> ${data.currency} ${data.finalBidAmount.toLocaleString()}</p>
            <!-- <p style="margin: 10px 0;"><strong>Winner:</strong> ${data.winnerInfo.name}</p> -->
            <p style="margin: 10px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 20px 0;">Next Steps:</h3>
          <ol style="color: #666; padding-left: 20px; line-height: 1.8;">
            <li>Wait for the buyer to complete payment</li>
            <li>Prepare items for shipment</li>
            <li>You'll be notified when payment is received</li>
          </ol>
          
          <p class="message">Congratulations on your successful sale!</p>
        </div>
        
        ${EMAIL_FOOTER}
      </div>
    </body>
    </html>
  `;
}

function getSellerNoSaleEmailTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Auction Has Ended</title>
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="email-container">
        ${EMAIL_HERO}
        
        <div class="content">
          <h1 class="title">📝 Your Auction Has Ended</h1>
          
          <p class="greeting">Dear ${data.sellerInfo.name},</p>
          
          <p class="message">Your auction has ended without any bids:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin-top: 0; color: #333;">${data.auctionTitle}</h3>
            <p style="margin: 10px 0; color: #666; font-style: italic;">No bids were received during the auction period.</p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 20px 0;">What's Next?</h3>
          <ul style="color: #666; padding-left: 20px; line-height: 1.8;">
            <li>Consider adjusting your starting price</li>
            <li>Review your item description and photos</li>
            <li>Relist your item for another auction</li>
          </ul>
          
          <p class="message">We're here to help you succeed with your next listing!</p>
        </div>
        
        ${EMAIL_FOOTER}
      </div>
    </body>
    </html>
  `;
}

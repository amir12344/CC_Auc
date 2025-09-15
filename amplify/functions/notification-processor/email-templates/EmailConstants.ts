// Reusable email styles
export const EMAIL_STYLES = `<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            padding: 30px 0 20px 0;
            background-color: #ffffff;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .logo {
            display: inline-block;
            font-size: 24px;
            font-weight: 700;
            color: #4CAF50;
            text-decoration: none;
            vertical-align: middle;
        }
        
        .logo-icon {
            width: 120px;
            height: 40px;
            margin-right: 12px;
        }
        
        .hero-section {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
            text-align: center;
            overflow: hidden;
        }
        
        .hero-logo {
            width: 100%;
            margin: 0 auto;
            display: block;
            text-align: center;
            line-height: 0;
            padding: 2% 3%;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .greeting {
            color: #666;
            margin-bottom: 20px;
        }
        
        .message {
            color: #666;
            margin-bottom: 10px;
        }
        
        .offer-link {
            color: #8b5cf6;
            text-decoration: underline;
        }
        
        .quote {
            font-style: italic;
            color: #888;
            margin: 20px 0;
            line-height: 1.5;
        }
        
        .offer-details {
            margin: 30px 0;
        }
        
        .offer-details-link {
            color: #8b5cf6;
            text-decoration: underline;
        }
        
        .cta-button {
            display: block;
            width: 100%;
            background-color: #333;
            color: white;
            text-align: center;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 30px 0;
            transition: background-color 0.2s;
        }
        
        .cta-button:hover {
            background-color: #222;
        }
        
        .footer {
            background-color: #1a1a1a;
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .tagline {
            font-style: italic;
            margin-bottom: 10px;
            color: #ccc;
        }
        
        .copyright {
            font-size: 14px;
            color: #888;
            margin-bottom: 20px;
        }
        
        .social-links {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .social-link {
            color: #888;
            font-size: 20px;
            text-decoration: none;
            margin: 0 7px;
            display: inline-block;
        }
        
        .social-link:hover {
            color: #ccc;
        }
        
        .footer-links {
            border-top: 1px solid #333;
            padding-top: 20px;
            font-size: 14px;
        }
        
        .footer-links-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .footer-links-table td {
            vertical-align: middle;
        }
        
        .footer-links-left {
            text-align: left;
        }
        
        .footer-links-right {
            text-align: right;
        }
        
        .privacy-link {
            color: #888;
            text-decoration: underline;
        }
        
        .unsubscribe-link {
            color: #888;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .footer-links-table {
                display: block;
            }
            
            .footer-links-table td {
                display: block;
                text-align: center !important;
                padding: 5px 0;
            }
        }
</style>`;

// Reusable header section
export const EMAIL_HEADER = `<!-- Header -->
        <div class="header">
            <a href="#" class="logo">
                <div class="logo-icon">
                    <img src="https://www.commercecentral.io/images/email/CommerceCentral_DoubleC_LogoOnly_Green_email.png" width="120" height="40" style="display: block;">
                </div>
            </a>
        </div>`;

// Reusable hero section
export const EMAIL_HERO = `<!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-logo">
                <img src="https://www.commercecentral.io/images/email/CommerceCentral_DoubleC_Logo_Green_email.png" width="100%" height="auto" style="display: block; max-width: 600px; height: auto; object-fit: cover;">
            </div>
        </div>`;

// Reusable footer section
export const EMAIL_FOOTER = `<!-- Footer -->
        <div class="footer">
            <p class="tagline">"The Trusted Channel For Surplus."</p>
            <p class="copyright">© Commerce Central 2025</p>
            
            <div class="social-links">
                <a href="#" class="social-link">𝕏</a>
                <a href="https://www.linkedin.com/company/commercecentral" class="social-link">in</a>
            </div>
            
            <div class="footer-links">
                <table class="footer-links-table">
                    <tr>
                        <td class="footer-links-left">
                            <a href="#" class="privacy-link">Privacy Policy</a>
                        </td>
                        <td class="footer-links-right">
                            <a href="#" class="unsubscribe-link">Unsubscribe</a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

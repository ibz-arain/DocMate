import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email using Brevo
export async function sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Verify your DocMate account";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">DocMate</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Document Processing Made Simple</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Verify your email address</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${firstName},<br><br>
            Thanks for signing up for DocMate! To complete your registration, please enter the verification code below:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't create a DocMate account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 DocMate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
  
  sendSmtpEmail.sender = { name: "DocMate", email: process.env.BREVO_FROM_EMAIL! };
  sendSmtpEmail.to = [{ email, name: firstName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number; userId: number }>();

// Store verification code
export function storeVerificationCode(email: string, code: string, userId: number): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  verificationCodes.set(email.toLowerCase(), { code, expiresAt, userId });
}

// Verify and remove verification code
export function verifyAndRemoveCode(email: string, code: string): { isValid: boolean; userId?: number } {
  const stored = verificationCodes.get(email.toLowerCase());
  
  if (!stored) {
    return { isValid: false };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email.toLowerCase());
    return { isValid: false };
  }
  
  if (stored.code !== code) {
    return { isValid: false };
  }
  
  // Remove the code after successful verification
  verificationCodes.delete(email.toLowerCase());
  return { isValid: true, userId: stored.userId };
}

// Clean up expired codes (run periodically)
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  verificationCodes.forEach((data, email) => {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  });
} 
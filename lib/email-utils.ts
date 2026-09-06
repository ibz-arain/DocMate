import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
(apiInstance as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY!

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email using Brevo
export async function sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Verify your Docimate account";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://docimate.ibrahimarain.com/logo-text.png" alt="Docimate" style="height: 40px; margin-bottom: 10px;">
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Document Processing Made Simple</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Verify your email address</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${firstName},<br><br>
            Thanks for signing up for Docimate! To complete your registration, please enter the verification code below:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1db5a3; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't create a Docimate account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 Docimate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
  
  sendSmtpEmail.sender = { name: "Docimate", email: process.env.BREVO_FROM_EMAIL! };
  sendSmtpEmail.to = [{ email, name: firstName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    // Check for IP restriction error
    if (error.body?.code === 'unauthorized' && error.body?.message?.includes('unrecognised IP address')) {
      throw new Error('IP address not authorized. Please add your IP address to the authorized list in your Brevo account security settings.');
    }
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Authentication failed - Please check your BREVO_API_KEY or IP restrictions');
    } else if (error.response?.status === 400) {
      throw new Error('Bad request - Please check your email configuration');
    } else {
      throw new Error(`Failed to send verification email: ${error.message || 'Unknown error'}`);
    }
  }
}

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number; userData: { firstName: string; lastName: string } }>();

// Store verification code
export function storeVerificationCode(email: string, code: string, userData: { firstName: string; lastName: string }): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  verificationCodes.set(email.toLowerCase(), { code, expiresAt, userData });
}

// Verify and remove verification code
export function verifyAndRemoveCode(email: string, code: string): { isValid: boolean; userData?: { firstName: string; lastName: string } } {
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
  return { isValid: true, userData: stored.userData };
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

// Store password reset codes in memory (in production, use Redis or database)
const passwordResetCodes = new Map<string, { code: string; expiresAt: number; userData: { firstName: string; lastName: string } }>();

// Send password reset email using Brevo
export async function sendPasswordResetEmail(email: string, code: string, firstName: string): Promise<void> {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Reset your Docimate password";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://docimate.ibrahimarain.com/logo-text.png" alt="Docimate" style="height: 40px; margin-bottom: 10px;">
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Document Processing Made Simple</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Reset your password</h2>
          <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${firstName},<br><br>
            We received a request to reset your Docimate password. Please enter the verification code below to continue:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1db5a3; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 Docimate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
  sendSmtpEmail.sender = { name: "Docimate", email: process.env.BREVO_FROM_EMAIL! };
  sendSmtpEmail.to = [{ email, name: firstName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Password reset email sent successfully to:', email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    // Check for IP restriction error
    if (error.body?.code === 'unauthorized' && error.body?.message?.includes('unrecognised IP address')) {
      throw new Error('IP address not authorized. Please add your IP address to the authorized list in your Brevo account security settings.');
    }
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Authentication failed - Please check your BREVO_API_KEY or IP restrictions');
    } else if (error.response?.status === 400) {
      throw new Error('Bad request - Please check your email configuration');
    } else {
      throw new Error(`Failed to send password reset email: ${error.message || 'Unknown error'}`);
    }
  }
}

// Store password reset code
export function storePasswordResetCode(email: string, code: string, userData: { firstName: string; lastName: string }): void {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  passwordResetCodes.set(email.toLowerCase(), { code, expiresAt, userData });
}

// Verify and remove password reset code
export function verifyAndRemovePasswordResetCode(email: string, code: string): { isValid: boolean; userData?: { firstName: string; lastName: string } } {
  const stored = passwordResetCodes.get(email.toLowerCase());
  
  if (!stored) {
    return { isValid: false };
  }
  
  if (Date.now() > stored.expiresAt) {
    passwordResetCodes.delete(email.toLowerCase());
    return { isValid: false };
  }
  
  if (stored.code !== code) {
    return { isValid: false };
  }
  
  // Remove the code after successful verification
  passwordResetCodes.delete(email.toLowerCase());
  return { isValid: true, userData: stored.userData };
}

// Clean up expired password reset codes (run periodically)
export function cleanupExpiredPasswordResetCodes(): void {
  const now = Date.now();
  passwordResetCodes.forEach((data, email) => {
    if (now > data.expiresAt) {
      passwordResetCodes.delete(email);
    }
  });
} 
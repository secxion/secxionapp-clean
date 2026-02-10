import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import axios from 'axios';

const { FRONTEND_URL } = process.env;

// Hostinger SMTP (Primary - for secxion.com)
const { HOSTINGER_SMTP_HOST, HOSTINGER_SMTP_PORT, HOSTINGER_SMTP_USER, HOSTINGER_SMTP_PASS } = process.env;

// Brevo as fallback
const { BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS, BREVO_SENDER_FROM_EMAIL, BREVO_API_KEY } = process.env;

// Gmail as last resort fallback
const { MAIL_USER, MAIL_PASS } = process.env;

console.log("📧 Email Configuration:");
console.log("   FRONTEND_URL:", FRONTEND_URL);

// Primary Transporter: Hostinger (verify@secxion.com)
let primaryTransporter = null;
if (HOSTINGER_SMTP_HOST && HOSTINGER_SMTP_USER && HOSTINGER_SMTP_PASS) {
  console.log("   HOSTINGER_SMTP_HOST:", HOSTINGER_SMTP_HOST);
  console.log("   HOSTINGER_SMTP_PORT:", HOSTINGER_SMTP_PORT || 465);
  console.log("   HOSTINGER_SMTP_USER:", HOSTINGER_SMTP_USER);
  console.log("   HOSTINGER_SMTP_PASS:", HOSTINGER_SMTP_PASS ? "✓ set" : "❌ not set");
  
  primaryTransporter = nodemailer.createTransport({
    host: HOSTINGER_SMTP_HOST,
    port: parseInt(HOSTINGER_SMTP_PORT || '465', 10),
    secure: parseInt(HOSTINGER_SMTP_PORT || '465', 10) === 465,
    auth: {
      user: HOSTINGER_SMTP_USER,
      pass: HOSTINGER_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  console.warn("⚠️ Hostinger SMTP not configured. Will use fallback mailers.");
}

// Secondary Transporter: Brevo (formerly Sendinblue)
let secondaryTransporter = null;
if (BREVO_SMTP_HOST && BREVO_SMTP_USER && BREVO_SMTP_PASS) {
  console.log("   BREVO configured as fallback");
  secondaryTransporter = nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: parseInt(BREVO_SMTP_PORT || '587', 10),
    secure: parseInt(BREVO_SMTP_PORT || '587', 10) === 465,
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Tertiary Transporter: Gmail
let gmailTransporter = null;
if (MAIL_USER && MAIL_PASS) {
  console.log("   Gmail configured as fallback");
  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Test connection on startup for primary mailer (Hostinger)
const testPrimaryConnection = async () => {
  if (!primaryTransporter) {
    console.warn('⏩ Hostinger SMTP not configured. Skipping connection test.');
    return false;
  }
  try {
    await primaryTransporter.verify();
    console.log('✅ Hostinger SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Hostinger SMTP connection failed:', error.message);
    return false;
  }
};

// Test connection on startup for secondary mailer if configured
const testSecondaryConnection = async () => {
  if (!secondaryTransporter) {
    console.warn('⏩ Brevo SMTP not configured. Skipping connection test.');
    return false;
  }
  try {
    await secondaryTransporter.verify();
    console.log('✅ Brevo SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Brevo SMTP connection failed:', error.message);
    return false;
  }
};

// Run connection tests on module load
testPrimaryConnection();
testSecondaryConnection();

// Default sender info
const DEFAULT_FROM_EMAIL = HOSTINGER_SMTP_USER || 'verify@secxion.com';
const DEFAULT_FROM_NAME = 'SECXION';

/**
 * Send email using Brevo HTTP API (works on Render free tier)
 */
const sendViaBrevoAPI = async (options, context) => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set. Cannot use Brevo HTTP API.');
  }

  const senderEmail = BREVO_SENDER_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const senderName = options.from?.match(/"([^"]+)"/)?.[1] || 'Secxion';

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.html
  };

  try {
    console.log(`📧 Attempting Brevo HTTP API for [${context}]...`);
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      timeout: 30000
    });
    console.log(`✅ Email sent via Brevo HTTP API [${context}]:`, response.data.messageId || 'success');
    return { messageId: response.data.messageId || 'brevo-api-success' };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(`❌ Brevo HTTP API failed for [${context}]:`, errorMsg);
    throw new Error(`Brevo HTTP API failed: ${errorMsg}`);
  }
};


/**
 * Sends an email using available methods with fallbacks.
 * Priority: 1. Hostinger SMTP, 2. Brevo HTTP API, 3. Brevo SMTP, 4. Gmail SMTP
 * @param {object} options - Nodemailer mail options.
 * @param {string} context - A description of the email's purpose (e.g., "Verification Email").
 * @returns {Promise<object>} - Info object on success.
 * @throws {Error} - If email sending fails through all configured methods.
 */
const sendEmail = async (options, context) => {
  const errors = [];

  // Method 1: Try Hostinger SMTP first (primary)
  if (primaryTransporter) {
    try {
      console.log(`✉️ Attempting Hostinger SMTP for [${context}]...`);
      const info = await primaryTransporter.sendMail(options);
      console.log(`✅ Email sent via Hostinger SMTP [${context}]:`, info.messageId);
      return info;
    } catch (hostingerError) {
      errors.push(`Hostinger SMTP: ${hostingerError.message}`);
      console.error(`❌ Hostinger SMTP failed for [${context}]:`, hostingerError.message);
    }
  }

  // Method 2: Try Brevo HTTP API (works on Render free tier)
  if (BREVO_API_KEY) {
    try {
      return await sendViaBrevoAPI(options, context);
    } catch (apiError) {
      errors.push(`Brevo API: ${apiError.message}`);
    }
  }

  // Method 3: Try Brevo SMTP
  if (secondaryTransporter) {
    try {
      console.log(`🔄 Trying Brevo SMTP for [${context}]...`);
      const modifiedOptions = { ...options };
      if (BREVO_SENDER_FROM_EMAIL) {
        modifiedOptions.from = `"${DEFAULT_FROM_NAME}" <${BREVO_SENDER_FROM_EMAIL}>`;
      }
      const info = await secondaryTransporter.sendMail(modifiedOptions);
      console.log(`✅ Email sent via Brevo SMTP [${context}]:`, info.messageId);
      return info;
    } catch (brevoError) {
      errors.push(`Brevo SMTP: ${brevoError.message}`);
      console.error(`❌ Brevo SMTP failed for [${context}]:`, brevoError.message);
    }
  }

  // Method 4: Try Gmail SMTP as last resort
  if (gmailTransporter) {
    try {
      console.log(`🔄 Trying Gmail SMTP for [${context}]...`);
      const modifiedOptions = { ...options };
      modifiedOptions.from = `"${DEFAULT_FROM_NAME}" <${MAIL_USER}>`;
      const info = await gmailTransporter.sendMail(modifiedOptions);
      console.log(`✅ Email sent via Gmail SMTP [${context}]:`, info.messageId);
      return info;
    } catch (gmailError) {
      errors.push(`Gmail SMTP: ${gmailError.message}`);
      console.error(`❌ Gmail SMTP failed for [${context}]:`, gmailError.message);
    }
  }

  // All methods failed
  throw new Error(`All email methods failed: ${errors.join('; ')}`);
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${DEFAULT_FROM_NAME}" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: "🛡️ Verify Your Email - Secxion",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to Secxion!</h2>
        <p>Click the button below to verify your email and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}"
             style="background-color: #007bff; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you did not sign up, you can safely ignore this email.
        </p>
        <p>– Team Secxion</p>
      </div>
    `,
  };

  await sendEmail(mailOptions, "Verification Email");
};

export const sendResetCodeEmail = async (email, code, type) => {
  const label = type === "password" ? "Reset Your Password" : "Reset Telegram Number";

  const mailOptions = {
    from: `"${DEFAULT_FROM_NAME}" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: `🔐 ${label} Code - Secxion`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">${label}</h2>
        <p>Use the verification code below to complete your ${type} reset request:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #007bff;
                      padding: 20px; border-radius: 10px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff;
                          letter-spacing: 4px;">${code}</span>
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">
          This code will expire in 10 minutes.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you did not request this, you can safely ignore this email.
        </p>
        <p>– Team Secxion</p>
      </div>
    `,
  };

  await sendEmail(mailOptions, "Reset Code Email");
};

export const sendBankVerificationCode = async (email, code) => {
  const mailOptions = {
    from: `"${DEFAULT_FROM_NAME}" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: `🔐 Confirm Bank Account Addition - Secxion`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bank Account Verification</h2>
        <p>Use the verification code below to confirm your bank account addition:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #28a745;
                      padding: 20px; border-radius: 10px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #28a745;
                          letter-spacing: 4px;">${code}</span>
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">
          This code will expire in 10 minutes.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you did not attempt to add a bank account, you can safely ignore this email.
        </p>
        <p>– Team Secxion</p>
      </div>
    `,
  };

  await sendEmail(mailOptions, "Bank Verification Email");
};

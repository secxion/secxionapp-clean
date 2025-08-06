import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const { MAIL_USER, MAIL_PASS, FRONTEND_URL } = process.env;

// New environment variables for secondary mailer (Brevo/Sendinblue)
const { BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS, BREVO_SENDER_FROM_EMAIL } = process.env;

if (!MAIL_USER || !MAIL_PASS) {
  throw new Error("Missing MAIL_USER or MAIL_PASS environment variables for primary (Gmail).");
}

console.log("MAIL_USER (Primary/Gmail):", MAIL_USER);
console.log("MAIL_PASS (Primary/Gmail):", MAIL_PASS ? "✓ set" : "❌ not set");
console.log("FRONTEND_URL:", FRONTEND_URL);

// Log secondary mailer credentials if available
if (BREVO_SMTP_HOST && BREVO_SMTP_PORT && BREVO_SMTP_USER && BREVO_SMTP_PASS) {
  console.log("BREVO_SMTP_HOST:", BREVO_SMTP_HOST);
  console.log("BREVO_SMTP_PORT:", BREVO_SMTP_PORT);
  console.log("BREVO_SMTP_USER:", BREVO_SMTP_USER);
  console.log("BREVO_SMTP_PASS:", BREVO_SMTP_PASS ? "✓ set" : "❌ not set");
  console.log("BREVO_SENDER_FROM_EMAIL:", BREVO_SENDER_FROM_EMAIL || "Not set - will default to Gmail 'from' address.");
} else {
  console.warn("Brevo credentials (BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS) are not fully set. Secondary mailer (Brevo) will not be available.");
}


// Primary Transporter: Gmail
const primaryTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  secure: true, // Use SSL/TLS for port 465 (default for 'gmail' service)
  requireTLS: true, // Enforce TLS even if not using secure: true
  tls: {
    rejectUnauthorized: false // Set to true in production if you have proper certificates
  }
});

// Secondary Transporter: Brevo (formerly Sendinblue)
let secondaryTransporter = null;
if (BREVO_SMTP_HOST && BREVO_SMTP_PORT && BREVO_SMTP_USER && BREVO_SMTP_PASS) {
  secondaryTransporter = nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: parseInt(BREVO_SMTP_PORT, 10), // Ensure port is an integer
    secure: parseInt(BREVO_SMTP_PORT, 10) === 465, // Use 'true' for 465, 'false' for 587 with STARTTLS
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Set to true in production
    }
  });
}

// Test connection on startup for primary mailer
const testPrimaryConnection = async () => {
  try {
    await primaryTransporter.verify();
    console.log('✅ Primary (Gmail) SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Primary (Gmail) SMTP connection failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔑 Authentication failed for Gmail. Please check:');
      console.error('   1. Use App Password (not regular Gmail password)');
      console.error('   2. Enable 2-Factor Authentication');
      console.error('   3. Generate App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      console.error('🌐 Network or firewall issue preventing connection to Gmail SMTP.');
    }
    return false;
  }
};

// Test connection on startup for secondary mailer if configured
const testSecondaryConnection = async () => {
  if (!secondaryTransporter) {
    console.warn('⏩ Secondary (Brevo) transporter not configured. Skipping connection test.');
    return false;
  }
  try {
    await secondaryTransporter.verify();
    console.log('✅ Secondary (Brevo) SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Secondary (Brevo) SMTP connection failed:', error.message);
    // Specific error handling for Brevo if needed
    return false;
  }
};

// Run connection tests on module load
testPrimaryConnection();
testSecondaryConnection();


/**
 * Sends an email using the primary transporter, with a fallback to the secondary.
 * @param {object} options - Nodemailer mail options.
 * @param {string} context - A description of the email's purpose (e.g., "Verification Email").
 * @returns {Promise<object>} - Nodemailer info object on success.
 * @throws {Error} - If email sending fails through all configured transporters.
 */
const sendEmail = async (options, context) => {
  let transporterToUse;
  let fromEmailForService = options.from; // Default to original from
  let serviceName = "Primary (Gmail)";

  try {
    transporterToUse = primaryTransporter;
    console.log(`✉️ Attempting to send email via ${serviceName} for [${context}]...`);
    const info = await transporterToUse.sendMail(options);
    console.log(`✅ Email sent successfully via ${serviceName} [${context}]:`, info.messageId);
    return info;

  } catch (primaryError) {
    console.error(`❌ ${serviceName} mailer failed for [${context}]:`, primaryError.message);
    console.log(`🔄 Falling back to Secondary (Brevo) mailer for [${context}]...`);

    if (secondaryTransporter) {
      transporterToUse = secondaryTransporter;
      serviceName = "Secondary (Brevo)";

      // IMPORTANT: Adjust 'from' address for Brevo if BREVO_SENDER_FROM_EMAIL is set
      // Brevo requires the 'from' address to be a sender verified in their platform.
      // If MAIL_USER (secxionxii@gmail.com) is not verified in Brevo, this will fail.
      if (BREVO_SENDER_FROM_EMAIL) {
          options.from = options.from.replace(MAIL_USER, BREVO_SENDER_FROM_EMAIL);
          console.log(`   (Using verified Brevo sender: ${BREVO_SENDER_FROM_EMAIL})`);
      } else {
          console.warn(`   ⚠️ Warning: BREVO_SENDER_FROM_EMAIL is not set. Using original 'from' address (${MAIL_USER}). Ensure it's verified in Brevo for best deliverability.`);
      }

      try {
        const info = await transporterToUse.sendMail(options);
        console.log(`✅ Email sent successfully via ${serviceName} [${context}]:`, info.messageId);
        return info;
      } catch (secondaryError) {
        console.error(`❌ ${serviceName} mailer also failed for [${context}]:`, secondaryError.message);
        if (secondaryError.response && (secondaryError.response.includes('Sender address not verified') || secondaryError.response.includes('Invalid sender'))) {
            console.error('📧 CRITICAL: The "from" email address used with Brevo is NOT VERIFIED in your Brevo account. Please verify it in Brevo "Senders & IPs".');
        }
        // Consolidate and re-throw the error
        throw new Error(`Email sending failed through both primary (Gmail) and secondary (Brevo) services. Primary error: ${primaryError.message}. Secondary error: ${secondaryError.message}`);
      }
    } else {
      // No secondary transporter configured
      throw new Error(`Email sending failed via Primary (Gmail): ${primaryError.message}. No secondary mailer configured.`);
    }
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  // Keep the `from` format consistent for initial call, it will be modified if fallback occurs
  const mailOptions = {
    from: `"Secxion 👁️‍🗨️" <${MAIL_USER}>`,
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
    from: `"Secxion 🛡️" <${MAIL_USER}>`,
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
    from: `"Secxion 🏦" <${MAIL_USER}>`,
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

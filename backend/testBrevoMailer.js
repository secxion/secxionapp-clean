import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// Ensure these environment variables are set in your .env file
const {
  BREVO_SMTP_HOST,
  BREVO_SMTP_PORT,
  BREVO_SMTP_USER,
  BREVO_SMTP_PASS,
  BREVO_SENDER_FROM_EMAIL,
  MAIL_USER,
} = process.env;

console.log("--- Brevo Email Simulation Test ---");
console.log("BREVO_SMTP_HOST:", BREVO_SMTP_HOST);
console.log("BREVO_SMTP_PORT:", BREVO_SMTP_PORT);
console.log("BREVO_SMTP_USER:", BREVO_SMTP_USER);
console.log("BREVO_SMTP_PASS:", BREVO_SMTP_PASS ? "✓ set" : "❌ not set");
console.log(
  "BREVO_SENDER_FROM_EMAIL (Expected From):",
  BREVO_SENDER_FROM_EMAIL,
);
console.log("MAIL_USER (Recipient):", MAIL_USER);

if (
  !BREVO_SMTP_HOST ||
  !BREVO_SMTP_PORT ||
  !BREVO_SMTP_USER ||
  !BREVO_SMTP_PASS ||
  !BREVO_SENDER_FROM_EMAIL ||
  !MAIL_USER
) {
  console.error(
    "❌ ERROR: One or more Brevo SMTP or recipient environment variables are missing. Please ensure BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_PASS, BREVO_SENDER_FROM_EMAIL, and MAIL_USER are set in your .env file.",
  );
  process.exit(1);
}

const runBrevoSimulationTest = async () => {
  const port = parseInt(BREVO_SMTP_PORT, 10);
  const secureConnection = port === 465;

  const transporter = nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: port,
    secure: secureConnection,
    auth: {
      user: BREVO_SMTP_USER,
      pass: BREVO_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    logger: true,
    debug: true,
  });

  try {
    console.log(
      `\nAttempting to verify connection to Brevo SMTP (${BREVO_SMTP_HOST}:${port})...`,
    );
    await transporter.verify();
    console.log("✅ Brevo SMTP connection verified successfully!");

    console.log("\n--- Simulating User Verification Email ---");

    // Generate a random 6-digit code for the simulation
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const mailOptions = {
      from: `"Secxion App" <${BREVO_SENDER_FROM_EMAIL}>`, // Set 'From' to your verified Brevo sender email
      to: MAIL_USER, // The user's email (your Gmail in this case)
      subject: `Your Secxion Verification Code: ${verificationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Secxion Email Verification</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">You are receiving this email because you requested a verification code for your Secxion account. Please use the following code to complete your action:</p>
          <div style="text-align: center; margin: 25px 0;">
            <strong style="font-size: 28px; color: #007bff; background-color: #f0f8ff; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;">${verificationCode}</strong>
          </div>
          <p style="font-size: 16px; color: #555;">This code is valid for a limited time.</p>
          <p style="font-size: 14px; color: #777;">If you did not request this code, please ignore this email.</p>
          <p style="font-size: 16px; color: #555;">Thanks,</p>
          <p style="font-size: 16px; color: #555;">The Secxion Team</p>
        </div>
      `,
      text: `Your verification code for Secxion is: ${verificationCode}`, // Plain text fallback
    };

    console.log(
      `\nSending test email from: "Secxion App" <${BREVO_SENDER_FROM_EMAIL}>`,
    );
    console.log(`To: <${MAIL_USER}>`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(
      `Expected content: "Your verification code is ${verificationCode}"`,
    );

    const info = await transporter.sendMail(mailOptions);
    console.log(
      "\n✅ Test email successfully queued by Brevo. Message ID:",
      info.messageId,
    );
    console.log("\n--- IMPORTANT ---");
    console.log(
      `Please check the inbox of "${MAIL_USER}" (including spam/junk folders).`,
    );
    console.log(
      `The email should appear to be from "Secxion App <${BREVO_SENDER_FROM_EMAIL}>"`,
    );
    console.log(
      `The subject should be "Your Secxion Verification Code: ${verificationCode}"`,
    );
    console.log(`And the body should contain the code "${verificationCode}".`);
  } catch (error) {
    console.error("❌ Brevo SMTP connection or email sending failed:");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Stack Trace:", error.stack);

    if (error.code === "EAUTH") {
      console.error(
        "🔑 Authentication failed. Double-check your BREVO_SMTP_USER (login) and BREVO_SMTP_PASS (SMTP key) from your Brevo account settings.",
      );
    } else if (error.code === "ETIMEDOUT" || error.code === "ESOCKET") {
      console.error(
        "🌐 Network/Firewall Issue. This is likely a problem with your server/network outbound access to Brevo. Consider:",
      );
      console.error(
        "   1. Checking your hosting provider's firewall/security group rules for outgoing connections on port 465 (or 587).",
      );
      console.error(
        "   2. Contacting your hosting provider to ask if they block outgoing SMTP traffic and how to unblock it or if they have an alternative recommended service/port.",
      );
    } else if (error.responseCode) {
      console.error("SMTP Server Response Code:", error.responseCode);
      console.error("SMTP Server Response:", error.response);
      if (
        error.response.includes("Sender address not verified") ||
        error.response.includes("Invalid sender")
      ) {
        console.error(
          `📧 CRITICAL: The "from" email address (${BREVO_SENDER_FROM_EMAIL}) used in mailOptions.from is NOT VERIFIED in your Brevo account. Please go to your Brevo dashboard, navigate to "Senders & IPs" -> "Senders", add "${BREVO_SENDER_FROM_EMAIL}" as a sender, and click the verification link in the email sent to it.`,
        );
      }
    }
  } finally {
    transporter.close();
  }
};

runBrevoSimulationTest();

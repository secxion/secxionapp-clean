import jwt from "jsonwebtoken";
import NewsletterSubscriber from "../models/newsletterSubscriberModel.js";
import userModel from "../models/userModel.js";
import {
  getNewsletterMailHealth,
  sendNewsletterCampaignEmail,
  sendNewsletterConfirmationEmail,
} from "../utils/mailer.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";
const TOKEN_SECRET = process.env.TOKEN_SECRET_KEY;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const createToken = (payload, expiresIn = "14d") => {
  if (!TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET_KEY is required for newsletter tokens.");
  }
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn });
};

const verifyToken = (token) => jwt.verify(token, TOKEN_SECRET);

const getConfirmLink = (token) => {
  const base = BACKEND_URL;
  return `${base}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
};

const getUnsubscribeLink = (token) => {
  const base = BACKEND_URL;
  return `${base}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
};

const summarizeCampaignFailure = (failureMessage = "") => {
  const message = String(failureMessage || "");

  if (message.includes("Sender address rejected")) {
    return "Sender mailbox rejected by SMTP provider. Align sender mailbox with authenticated SMTP account.";
  }

  if (message.includes("unrecognised IP address") || message.includes("unrecognized IP address")) {
    return "Brevo API rejected server IP. Authorize your current server IP in Brevo security settings.";
  }

  if (message.includes("Authentication failed") || message.includes("Invalid login")) {
    return "SMTP authentication failed for fallback provider. Verify SMTP username/password credentials.";
  }

  return "Campaign could not be delivered. Please verify newsletter sender and provider configuration.";
};

const ensureRegisteredUsersSubscribed = async () => {
  const users = await userModel.find({}, "email");
  if (!users.length) return;

  const now = new Date();

  const normalizedUserEmails = users
    .map((user) => normalizeEmail(user.email))
    .filter((email) => EMAIL_REGEX.test(email));

  if (!normalizedUserEmails.length) return;

  const existingSubscribers = await NewsletterSubscriber.find({
    email: { $in: normalizedUserEmails },
  }).select("email status");

  const existingMap = new Map(
    existingSubscribers.map((subscriber) => [
      normalizeEmail(subscriber.email),
      subscriber,
    ]),
  );

  const bulkOps = [];

  for (const email of normalizedUserEmails) {
    const existing = existingMap.get(email);

    if (!existing) {
      bulkOps.push({
        insertOne: {
          document: {
            email,
            status: "active",
            source: "registered-user",
            subscribedAt: now,
            confirmedAt: now,
            unsubscribedAt: null,
          },
        },
      });
      continue;
    }

    if (existing.status === "pending") {
      bulkOps.push({
        updateOne: {
          filter: { _id: existing._id },
          update: {
            $set: {
              status: "active",
              source: "registered-user",
              confirmedAt: now,
              unsubscribedAt: null,
            },
          },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    await NewsletterSubscriber.bulkWrite(bulkOps, { ordered: false });
  }
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const source = String(req.body?.source || "website").trim() || "website";

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "A valid email address is required.",
      });
    }

    let subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
      subscriber = await NewsletterSubscriber.create({ email, source, status: "pending" });
    } else if (subscriber.status !== "active") {
      subscriber.status = "pending";
      subscriber.source = source || subscriber.source;
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = null;
      await subscriber.save();
    }

    if (subscriber.status === "active") {
      return res.status(200).json({
        success: true,
        error: false,
        message: "You are already subscribed to the Secxion newsletter.",
      });
    }

    const token = createToken({ purpose: "newsletter-confirm", email }, "7d");
    const confirmLink = getConfirmLink(token);
    await sendNewsletterConfirmationEmail(email, confirmLink);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Confirmation email sent. Please check your inbox to activate your subscription.",
    });
  } catch (error) {
    console.error("[newsletter] subscribe error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Unable to process newsletter subscription right now.",
    });
  }
};

export const confirmNewsletterSubscription = async (req, res) => {
  try {
    const token = req.query?.token;

    if (!token) {
      return res.status(400).send("Missing confirmation token.");
    }

    const decoded = verifyToken(token);
    if (decoded.purpose !== "newsletter-confirm") {
      return res.status(400).send("Invalid confirmation token.");
    }

    const email = normalizeEmail(decoded.email);
    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).send("Subscription record not found.");
    }

    subscriber.status = "active";
    subscriber.confirmedAt = new Date();
    subscriber.unsubscribedAt = null;
    await subscriber.save();

    const redirectUrl = req.query?.redirect || `${FRONTEND_URL}/contact-us?newsletter=confirmed`;
    if (redirectUrl) {
      return res.redirect(302, redirectUrl);
    }

    return res.status(200).send("Newsletter subscription confirmed.");
  } catch (error) {
    console.error("[newsletter] confirm error:", error.message);
    return res.status(400).send("Invalid or expired confirmation link.");
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const token = req.query?.token;

    if (!token) {
      return res.status(400).send("Missing unsubscribe token.");
    }

    const decoded = verifyToken(token);
    if (decoded.purpose !== "newsletter-unsubscribe") {
      return res.status(400).send("Invalid unsubscribe token.");
    }

    const email = normalizeEmail(decoded.email);
    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).send("Subscription record not found.");
    }

    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    const redirectUrl = req.query?.redirect || `${FRONTEND_URL}/contact-us?newsletter=unsubscribed`;
    if (redirectUrl) {
      return res.redirect(302, redirectUrl);
    }

    return res.status(200).send("You have been unsubscribed from the newsletter.");
  } catch (error) {
    console.error("[newsletter] unsubscribe error:", error.message);
    return res.status(400).send("Invalid or expired unsubscribe link.");
  }
};

export const getNewsletterSubscribers = async (req, res) => {
  try {
    await ensureRegisteredUsersSubscribed();

    const status = String(req.query?.status || "all");
    const search = String(req.query?.search || "").trim();

    const query = {};
    if (status !== "all") {
      query.status = status;
    }
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ createdAt: -1 })
      .limit(500);

    return res.status(200).json({
      success: true,
      error: false,
      data: subscribers,
    });
  } catch (error) {
    console.error("[newsletter] get subscribers error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Unable to fetch newsletter subscribers.",
    });
  }
};

export const getNewsletterStats = async (_req, res) => {
  try {
    await ensureRegisteredUsersSubscribed();

    const [total, active, pending, unsubscribed] = await Promise.all([
      NewsletterSubscriber.countDocuments({}),
      NewsletterSubscriber.countDocuments({ status: "active" }),
      NewsletterSubscriber.countDocuments({ status: "pending" }),
      NewsletterSubscriber.countDocuments({ status: "unsubscribed" }),
    ]);

    return res.status(200).json({
      success: true,
      error: false,
      data: { total, active, pending, unsubscribed },
    });
  } catch (error) {
    console.error("[newsletter] get stats error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Unable to fetch newsletter stats.",
    });
  }
};

export const getNewsletterHealth = async (_req, res) => {
  try {
    const health = getNewsletterMailHealth();
    return res.status(200).json({
      success: true,
      error: false,
      data: health,
    });
  } catch (error) {
    console.error("[newsletter] health check error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Unable to fetch newsletter mail health.",
    });
  }
};

export const sendNewsletterCampaign = async (req, res) => {
  try {
    await ensureRegisteredUsersSubscribed();

    const subject = String(req.body?.subject || "").trim();
    const html = String(req.body?.html || "").trim();
    const text = String(req.body?.text || "").trim();
    const recipientMode = String(req.body?.recipientMode || "all").trim().toLowerCase();
    const requestedRecipientEmails = Array.isArray(req.body?.recipientEmails)
      ? req.body.recipientEmails
      : [];

    if (!subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Subject and email content are required.",
      });
    }

    if (!["all", "specific"].includes(recipientMode)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid recipient mode.",
      });
    }

    const normalizedRequestedEmails = [
      ...new Set(
        requestedRecipientEmails
          .map((value) => String(value || "").trim().toLowerCase())
          .filter((value) => EMAIL_REGEX.test(value)),
      ),
    ];

    if (recipientMode === "specific" && !normalizedRequestedEmails.length) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Select at least one valid email for specific recipients.",
      });
    }

    const recipientQuery = { status: "active" };
    if (recipientMode === "specific") {
      recipientQuery.email = { $in: normalizedRequestedEmails };
    }

    const recipients = await NewsletterSubscriber.find(recipientQuery).select("email");

    if (!recipients.length) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          recipientMode === "specific"
            ? "No active subscribers found for selected emails."
            : "No active subscribers found.",
      });
    }

    const targetedEmailSet = new Set(recipients.map((item) => item.email?.toLowerCase()));
    const skippedRequestedEmails =
      recipientMode === "specific"
        ? normalizedRequestedEmails.filter((email) => !targetedEmailSet.has(email))
        : [];

    let sentCount = 0;
    const failures = [];

    for (const recipient of recipients) {
      try {
        const unsubscribeToken = createToken(
          { purpose: "newsletter-unsubscribe", email: recipient.email },
          "180d",
        );
        const unsubscribeLink = getUnsubscribeLink(unsubscribeToken);

        await sendNewsletterCampaignEmail({
          to: recipient.email,
          subject,
          html,
          text,
          unsubscribeLink,
        });

        sentCount += 1;
        await NewsletterSubscriber.updateOne(
          { _id: recipient._id },
          { $set: { lastCampaignAt: new Date() } },
        );
      } catch (sendError) {
        failures.push({ email: recipient.email, error: sendError.message });
      }
    }

    if (sentCount === 0) {
      const firstFailure = failures[0]?.error || "";
      return res.status(502).json({
        success: false,
        error: true,
        message: summarizeCampaignFailure(firstFailure),
        data: {
          recipientMode,
          requested: recipientMode === "specific" ? normalizedRequestedEmails.length : null,
          total: recipients.length,
          sent: 0,
          failed: failures.length,
          failures,
          skippedRequestedEmails,
        },
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: `Campaign completed. Sent to ${sentCount} subscriber(s).`,
      data: {
        recipientMode,
        requested: recipientMode === "specific" ? normalizedRequestedEmails.length : null,
        total: recipients.length,
        sent: sentCount,
        failed: failures.length,
        failures,
        skippedRequestedEmails,
      },
    });
  } catch (error) {
    console.error("[newsletter] send campaign error:", error.message);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Unable to send newsletter campaign.",
    });
  }
};

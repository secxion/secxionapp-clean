import axios from "axios";

const DEFAULT_TERMII_BASE_URL = "https://api.ng.termii.com/api/sms/send";
const DEFAULT_AT_BASE_URL = "https://api.sandbox.africastalking.com/version1/messaging";

const normalizePhoneNumber = (value = "") =>
  String(value)
    .trim()
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

const normalizeSecret = (value = "") =>
  String(value)
    .trim()
    .replace(/^['"`]+|['"`]+$/g, "");

const getSmsProvider = () =>
  String(process.env.SMS_PROVIDER || "termii").trim().toLowerCase();

export const getSmsHealthStatus = () => ({
  provider: getSmsProvider(),
  configured:
    getSmsProvider() === "dev"
      ? true
      : getSmsProvider() === "africastalking"
      ? Boolean(process.env.AT_API_KEY && process.env.AT_USERNAME)
      : Boolean(process.env.TERMII_API_KEY),
  baseUrl:
    getSmsProvider() === "africastalking"
      ? process.env.AT_BASE_URL || DEFAULT_AT_BASE_URL
      : process.env.TERMII_BASE_URL || DEFAULT_TERMII_BASE_URL,
  senderId:
    getSmsProvider() === "africastalking"
      ? process.env.AT_SENDER_ID || ""
      : process.env.TERMII_SENDER_ID || "Secxion",
  channel: process.env.TERMII_CHANNEL || "generic",
});

const sendWithTermii = async (phoneNumber, code) => {
  const apiKey = normalizeSecret(process.env.TERMII_API_KEY || "");
  const baseUrl = process.env.TERMII_BASE_URL || DEFAULT_TERMII_BASE_URL;
  const senderId = process.env.TERMII_SENDER_ID || "Secxion";
  const channel = process.env.TERMII_CHANNEL || "generic";

  if (!apiKey) {
    throw new Error(
      "SMS provider is not configured. Set TERMII_API_KEY to enable phone verification SMS.",
    );
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const message = `Your Secxion KYC phone verification code is ${code}. This code expires in 10 minutes.`;

  const payload = {
    api_key: apiKey,
    to: normalizedPhone,
    from: senderId,
    sms: message,
    type: "plain",
    channel,
  };

  let data;

  try {
    const response = await axios.post(baseUrl, payload, {
      timeout: 15000,
    });
    data = response.data;
  } catch (error) {
    const providerData = error?.response?.data;
    const providerMessage =
      providerData?.message ||
      providerData?.error ||
      error?.message ||
      "SMS provider request failed";

    const wrappedError = new Error(`SMS delivery failed: ${providerMessage}`);
    wrappedError.providerStatus = error?.response?.status || 502;
    throw wrappedError;
  }

  if (!data || String(data.code) !== "ok") {
    const providerError =
      data?.message || data?.error || "Unknown SMS provider response";
    const wrappedError = new Error(`SMS delivery failed: ${providerError}`);
    wrappedError.providerStatus = Number(data?.code) || 502;
    throw wrappedError;
  }

  return {
    success: true,
    messageId: data?.message_id || null,
  };
};

const sendWithAfricasTalking = async (phoneNumber, code) => {
  const apiKey = normalizeSecret(process.env.AT_API_KEY || "");
  const username = String(process.env.AT_USERNAME || "").trim();
  const baseUrl = process.env.AT_BASE_URL || DEFAULT_AT_BASE_URL;
  const senderId = String(process.env.AT_SENDER_ID || "").trim();

  if (!apiKey || !username) {
    throw new Error(
      "SMS provider is not configured. Set AT_API_KEY and AT_USERNAME to enable Africa's Talking SMS.",
    );
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const message = `Your Secxion KYC phone verification code is ${code}. This code expires in 10 minutes.`;

  const form = new URLSearchParams();
  form.append("username", username);
  form.append("to", normalizedPhone);
  form.append("message", message);
  if (senderId) {
    form.append("from", senderId);
  }

  let data;

  try {
    const response = await axios.post(baseUrl, form.toString(), {
      timeout: 15000,
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });
    data = response.data;
  } catch (error) {
    const providerData = error?.response?.data;
    const providerMessage =
      providerData?.SMSMessageData?.Message ||
      providerData?.message ||
      providerData?.error ||
      error?.message ||
      "SMS provider request failed";

    const wrappedError = new Error(`SMS delivery failed: ${providerMessage}`);
    wrappedError.providerStatus = error?.response?.status || 502;
    throw wrappedError;
  }

  const recipients = data?.SMSMessageData?.Recipients || [];
  const first = recipients[0] || null;
  const atStatusCode = Number(first?.statusCode);
  const isSuccess =
    Number.isFinite(atStatusCode) && atStatusCode >= 100 && atStatusCode < 200;

  if (!isSuccess) {
    const providerError =
      first?.status ||
      data?.SMSMessageData?.Message ||
      data?.message ||
      "Unknown SMS provider response";
    const wrappedError = new Error(`SMS delivery failed: ${providerError}`);
    wrappedError.providerStatus = 400;
    throw wrappedError;
  }

  return {
    success: true,
    messageId: first?.messageId || null,
  };
};

const sendWithDevProvider = async (phoneNumber, code) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhone) {
    const wrappedError = new Error("SMS delivery failed: invalid phone number");
    wrappedError.providerStatus = 400;
    throw wrappedError;
  }

  console.info("[SMS][DEV] OTP generated for testing", {
    phoneNumber: normalizedPhone,
    code,
  });

  return {
    success: true,
    messageId: `dev-${Date.now()}`,
  };
};

export const sendKycPhoneOtpSms = async (phoneNumber, code) => {
  const provider = getSmsProvider();

  if (provider === "dev") {
    return sendWithDevProvider(phoneNumber, code);
  }

  if (provider === "africastalking") {
    return sendWithAfricasTalking(phoneNumber, code);
  }

  if (provider !== "termii") {
    throw new Error(
      `SMS provider is not supported: ${provider}. Use SMS_PROVIDER=dev, SMS_PROVIDER=termii or SMS_PROVIDER=africastalking.`,
    );
  }

  return sendWithTermii(phoneNumber, code);
};

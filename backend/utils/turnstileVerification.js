/**
 * Cloudflare Turnstile verification utility
 * Verifies the Turnstile token on the backend using Cloudflare's siteverify API
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token
 * @param {string} token - The token received from the frontend
 * @param {string} remoteIp - Optional: The user's IP address
 * @returns {Promise<{success: boolean, errorCodes?: string[]}>}
 */
export const verifyTurnstileToken = async (token, remoteIp = null) => {
  const secretKey =
    process.env.NODE_ENV === "production"
      ? TURNSTILE_SECRET_KEY
      : process.env.TURNSTILE_SECRET_KEY_DEV || TURNSTILE_TEST_SECRET_KEY;
  const isBypassEnabled = process.env.TURNSTILE_ALLOW_DEV_BYPASS === "true";

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  if (!secretKey) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY not configured");
    if (process.env.NODE_ENV === "development" && isBypassEnabled) {
      console.log("✅ Turnstile bypassed (development mode with explicit bypass flag)");
      return { success: true };
    }
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Turnstile verification successful");
      return { success: true };
    } else {
      console.log("❌ Turnstile verification failed:", result["error-codes"]);
      return { success: false, errorCodes: result["error-codes"] || [] };
    }
  } catch (error) {
    console.error("🔥 Turnstile verification error:", error);
    return { success: false, errorCodes: ["verification-error"] };
  }
};

export default verifyTurnstileToken;

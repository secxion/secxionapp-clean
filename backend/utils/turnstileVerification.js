/**
 * Cloudflare Turnstile verification utility
 * Verifies the Turnstile token on the backend using Cloudflare's siteverify API
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token
 * @param {string} token - The token received from the frontend
 * @param {string} remoteIp - Optional: The user's IP address
 * @returns {Promise<{success: boolean, errorCodes?: string[]}>}
 */
export const verifyTurnstileToken = async (token, remoteIp = null) => {
  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY not configured - allowing in development mode");
    // In development mode without secret key, allow all tokens
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production") {
      console.log("✅ Turnstile bypassed (development mode)");
      return { success: true };
    }
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
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

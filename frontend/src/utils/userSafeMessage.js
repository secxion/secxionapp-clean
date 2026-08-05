const NETWORK_PATTERNS = [
  /socket\s+['"]?secureconnect['"]?\s+timed\s+out/i,
  /connecttimeoutms/i,
  /econnrefused/i,
  /enotfound/i,
  /network\s*error/i,
  /failed\s+to\s+fetch/i,
  /request\s+timed\s+out/i,
  /timeout/i,
];

const AUTH_PATTERNS = [/csrf/i, /token/i, /unauthorized/i, /forbidden/i];

export const toUserSafeMessage = (
  rawMessage,
  fallback = 'Something went wrong. Please try again.',
) => {
  const message = String(rawMessage || '').trim();
  if (!message) return fallback;

  if (NETWORK_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'Unable to connect right now. Please check your internet connection and try again.';
  }

  if (AUTH_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'Your session could not be verified. Please refresh the page and try again.';
  }

  // Prevent leaking internal stack/driver details to users.
  if (message.length > 140) {
    return fallback;
  }

  return message;
};

export default toUserSafeMessage;

const NETWORK_PATTERNS = [
  /socket\s+['"]?secureconnect['"]?\s+timed\s+out/i,
  /connecttimeoutms/i,
  /econnrefused/i,
  /enotfound/i,
  /network\s*error/i,
  /failed\s+to\s+fetch/i,
  /request\s+(?:timed\s+out|timeout)/i,
  /timeout/i,
];

const AUTH_PATTERNS = [/csrf/i, /token/i, /unauthorized/i, /forbidden/i];

const INTERNAL_PATTERNS = [
  /api\s+error/i,
  /bson|mongodb|mongoose/i,
  /cannot\s+(get|post|put|patch|delete)\s+\//i,
  /econnreset|socket\s+hang\s+up/i,
  /failed\s+to\s+parse/i,
  /internal\s+server\s+error/i,
  /syntaxerror|typeerror|referenceerror/i,
  /<!doctype|<html/i,
];

const STATUS_MESSAGES = {
  400: 'We could not complete that request. Check your details and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'This action is not available for your account.',
  404: 'We could not find what you were looking for.',
  409: 'This information changed recently. Refresh the page and try again.',
  422: 'Some details need your attention before you continue.',
  429: 'Too many attempts were made. Please wait a moment and try again.',
  500: 'We could not complete this right now. Please try again shortly.',
  502: 'We could not complete this right now. Please try again shortly.',
  503: 'This service is temporarily unavailable. Please try again shortly.',
  504: 'The request took too long. Please check your internet connection and try again.',
};

export const USER_MESSAGE = {
  NETWORK:
    'We could not connect. Please check your internet connection and try again.',
  SESSION:
    'Your session could not be verified. Please refresh the page and try again.',
  DEFAULT: 'Something went wrong. Please try again.',
};

const getRawMessage = (value) => {
  if (value instanceof Error) return value.message;
  if (typeof value === 'object' && value?.message) return value.message;
  return value;
};

export const toUserSafeMessage = (
  rawMessage,
  fallback = USER_MESSAGE.DEFAULT,
  options = {},
) => {
  const { status } = options;
  const message = String(getRawMessage(rawMessage) || '').trim();
  const errorName = rawMessage?.name;

  if (errorName === 'AbortError') return USER_MESSAGE.NETWORK;
  if (!message) return STATUS_MESSAGES[status] || fallback;

  if (NETWORK_PATTERNS.some((pattern) => pattern.test(message))) {
    return USER_MESSAGE.NETWORK;
  }

  if (AUTH_PATTERNS.some((pattern) => pattern.test(message))) {
    return status === 401 ? STATUS_MESSAGES[401] : USER_MESSAGE.SESSION;
  }

  if (
    message.length > 140 ||
    INTERNAL_PATTERNS.some((pattern) => pattern.test(message))
  ) {
    return STATUS_MESSAGES[status] || fallback;
  }

  return message;
};

export default toUserSafeMessage;

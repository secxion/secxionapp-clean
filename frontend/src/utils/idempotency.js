export const createIdempotencyKey = (prefix = 'request') => {
  const randomPart =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${randomPart}`;
};

export const TRANSACTION_ACTIVITY_EVENT = 'secxion:transaction-activity';

export const emitTransactionActivity = (detail = {}) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(TRANSACTION_ACTIVITY_EVENT, {
      detail: {
        timestamp: Date.now(),
        ...detail,
      },
    }),
  );
};

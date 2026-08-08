import { toUserSafeMessage, USER_MESSAGE } from './userSafeMessage';

describe('toUserSafeMessage', () => {
  it('translates browser network failures into a clear next step', () => {
    expect(toUserSafeMessage(new TypeError('Failed to fetch'))).toBe(
      USER_MESSAGE.NETWORK,
    );
  });

  it('translates aborted requests without exposing timeout jargon', () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';

    expect(toUserSafeMessage(error)).toBe(USER_MESSAGE.NETWORK);
  });

  it('uses plain status guidance when no server message is available', () => {
    expect(toUserSafeMessage('', undefined, { status: 503 })).toBe(
      'This service is temporarily unavailable. Please try again shortly.',
    );
  });

  it('does not expose internal API details', () => {
    expect(
      toUserSafeMessage('API error: 500 Internal Server Error', undefined, {
        status: 500,
      }),
    ).toBe('We could not complete this right now. Please try again shortly.');
  });

  it('preserves short actionable domain messages', () => {
    expect(
      toUserSafeMessage('Complete KYC to unlock unlimited withdrawals.'),
    ).toBe('Complete KYC to unlock unlimited withdrawals.');
  });
});

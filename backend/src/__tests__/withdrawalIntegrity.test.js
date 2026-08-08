import { jest } from "@jest/globals";
import { createMockResponse } from "./testUtils.js";

const paymentFindOne = jest.fn();
const paymentCreate = jest.fn();
const ethFindOne = jest.fn();
const ethCreate = jest.fn();
const walletFindOne = jest.fn();
const userFindById = jest.fn();
const startSession = jest.fn();
const updateWalletBalance = jest.fn();
const createTransactionNotification = jest.fn();
const axiosGet = jest.fn();

jest.unstable_mockModule("../../models/paymentRequestModel.js", () => ({
  default: {
    findOne: paymentFindOne,
    find: jest.fn(),
    create: paymentCreate,
  },
}));

jest.unstable_mockModule("../../models/ethWithdrawalRequestModel.js", () => ({
  default: {
    findOne: ethFindOne,
    find: jest.fn(),
    create: ethCreate,
  },
}));

jest.unstable_mockModule("../../models/walletModel.js", () => ({
  default: { findOne: walletFindOne },
}));

jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: { findById: userFindById },
}));

jest.unstable_mockModule("mongoose", () => ({
  default: { startSession },
}));

jest.unstable_mockModule("../../controller/wallet/walletController.js", () => ({
  updateWalletBalance,
}));

jest.unstable_mockModule(
  "../../controller/notifications/notificationsController.js",
  () => ({ createTransactionNotification }),
);

jest.unstable_mockModule("axios", () => ({
  default: { get: axiosGet },
}));

const { createPaymentRequest } = await import(
  "../../controller/wallet/paymentRequestController.js"
);
const { createEthWithdrawalRequest } = await import(
  "../../controller/ethWithdrawalController.js"
);

const validKey = "withdrawal_request_1234567890";

const createRequest = (body, key = validKey) => ({
  body,
  userId: "user-123",
  headers: key ? { "idempotency-key": key } : {},
  get: jest.fn((header) =>
    header === "Idempotency-Key" ? key || undefined : undefined,
  ),
});

const createSession = () => ({
  withTransaction: jest.fn(async (operation) => operation()),
  endSession: jest.fn().mockResolvedValue(undefined),
});

const sessionQuery = (value) => ({
  session: jest.fn().mockResolvedValue(value),
});

const userQuery = (value = { kycStatus: "approved" }) => ({
  select: jest.fn(() => sessionQuery(value)),
});

describe("withdrawal financial integrity", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    createTransactionNotification.mockResolvedValue(undefined);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("rejects bank withdrawals without an idempotency key", async () => {
    const req = createRequest(
      {
        amount: 1000,
        paymentMethod: "Bank Transfer",
        bankAccountId: "bank-1",
      },
      "",
    );
    const res = createMockResponse();

    await createPaymentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "INVALID_IDEMPOTENCY_KEY" }),
    );
    expect(paymentFindOne).not.toHaveBeenCalled();
    expect(startSession).not.toHaveBeenCalled();
  });

  it("replays an existing bank request without debiting twice", async () => {
    const existingRequest = { _id: "payment-1", amount: 1000 };
    paymentFindOne.mockResolvedValue(existingRequest);
    const req = createRequest({ amount: 1000 });
    const res = createMockResponse();

    await createPaymentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: existingRequest,
        idempotentReplay: true,
      }),
    );
    expect(updateWalletBalance).not.toHaveBeenCalled();
    expect(createTransactionNotification).not.toHaveBeenCalled();
  });

  it("does not notify or report success when the bank debit fails", async () => {
    const session = createSession();
    const savedRequest = { _id: "payment-2", amount: 1000 };
    paymentFindOne
      .mockResolvedValueOnce(null)
      .mockReturnValueOnce(sessionQuery(null));
    userFindById.mockReturnValue(userQuery());
    walletFindOne.mockReturnValue(
      sessionQuery({
        _id: "wallet-1",
        balance: 5000,
        bankAccounts: {
          id: jest.fn(() => ({
            accountNumber: "0123456789",
            bankName: "Test Bank",
            accountHolderName: "Test User",
          })),
        },
      }),
    );
    paymentCreate.mockResolvedValue([savedRequest]);
    updateWalletBalance.mockResolvedValue({
      success: false,
      message: "Debit failed",
    });
    startSession.mockResolvedValue(session);
    const req = createRequest({
      amount: 1000,
      paymentMethod: "Bank Transfer",
      bankAccountId: "bank-1",
    });
    const res = createMockResponse();

    await createPaymentRequest(req, res);

    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "WALLET_DEBIT_FAILED",
      }),
    );
    expect(createTransactionNotification).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  it("notifies only after a successful bank debit", async () => {
    const session = createSession();
    const savedRequest = { _id: "payment-3", amount: 1000 };
    paymentFindOne
      .mockResolvedValueOnce(null)
      .mockReturnValueOnce(sessionQuery(null));
    userFindById.mockReturnValue(userQuery());
    walletFindOne.mockReturnValue(
      sessionQuery({
        _id: "wallet-1",
        balance: 5000,
        bankAccounts: {
          id: jest.fn(() => ({
            accountNumber: "0123456789",
            bankName: "Test Bank",
            accountHolderName: "Test User",
          })),
        },
      }),
    );
    paymentCreate.mockResolvedValue([savedRequest]);
    updateWalletBalance.mockResolvedValue({ success: true });
    startSession.mockResolvedValue(session);
    const req = createRequest({
      amount: 1000,
      paymentMethod: "Bank Transfer",
      bankAccountId: "bank-1",
    });
    const res = createMockResponse();

    await createPaymentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(createTransactionNotification).toHaveBeenCalledTimes(1);
    expect(updateWalletBalance.mock.invocationCallOrder[0]).toBeLessThan(
      createTransactionNotification.mock.invocationCallOrder[0],
    );
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  it("returns success when notification fails after the bank commit", async () => {
    const session = createSession();
    const savedRequest = { _id: "payment-4", amount: 1000 };
    paymentFindOne
      .mockResolvedValueOnce(null)
      .mockReturnValueOnce(sessionQuery(null));
    userFindById.mockReturnValue(userQuery());
    walletFindOne.mockReturnValue(
      sessionQuery({
        _id: "wallet-1",
        balance: 5000,
        bankAccounts: {
          id: jest.fn(() => ({
            accountNumber: "0123456789",
            bankName: "Test Bank",
            accountHolderName: "Test User",
          })),
        },
      }),
    );
    paymentCreate.mockResolvedValue([savedRequest]);
    updateWalletBalance.mockResolvedValue({ success: true });
    createTransactionNotification.mockRejectedValue(
      new Error("Notification unavailable"),
    );
    startSession.mockResolvedValue(session);
    const req = createRequest({
      amount: 1000,
      paymentMethod: "Bank Transfer",
      bankAccountId: "bank-1",
    });
    const res = createMockResponse();

    await createPaymentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, idempotentReplay: false }),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Payment request committed, but notification failed:",
      expect.any(Error),
    );
  });

  it("rejects an ETH net amount above the server-calculated gross", async () => {
    ethFindOne.mockResolvedValue(null);
    axiosGet.mockResolvedValue({ data: { ethereum: { ngn: 1000000 } } });
    const req = createRequest({
      ethRecipientAddress: "0x123",
      nairaRequestedAmount: 1000,
      ethNetAmountToSend: 0.002,
    });
    const res = createMockResponse();

    await createEthWithdrawalRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "INVALID_ETH_NET_AMOUNT" }),
    );
    expect(startSession).not.toHaveBeenCalled();
    expect(updateWalletBalance).not.toHaveBeenCalled();
  });

  it("replays an existing ETH request before fetching a new rate", async () => {
    const existingRequest = { _id: "eth-1", nairaRequestedAmount: 1000 };
    ethFindOne.mockResolvedValue(existingRequest);
    const req = createRequest({
      ethRecipientAddress: "0x123",
      nairaRequestedAmount: 1000,
      ethNetAmountToSend: 0.0009,
    });
    const res = createMockResponse();

    await createEthWithdrawalRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: existingRequest,
        idempotentReplay: true,
      }),
    );
    expect(axiosGet).not.toHaveBeenCalled();
    expect(updateWalletBalance).not.toHaveBeenCalled();
  });
});

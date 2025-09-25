import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

import userSignUpController from '../controller/user/userSignUp.js';
import userSignInController from '../controller/user/userSignin.js';
import userDetailsController from '../controller/user/userDetails.js';
import authToken from '../middleware/authToken.js';
import userLogout from '../controller/user/userLogout.js';
import allUsers from '../controller/user/allUsers.js';
import updateUser from '../controller/user/UpdateUser.js';
import UploadProductController from '../controller/product/uploadProduct.js';
import getProductController from '../controller/product/getProduct.js';
import updateProductController from '../controller/product/updateProduct.js';
import getCategoryProduct from '../controller/product/getCategoryProductOne.js';
import getCategoryWiseProduct from '../controller/product/getCategoryWiseProduct.js';
import getProductDetails from '../controller/product/getProductDetails.js';
import SearchProduct from '../controller/product/searchProduct.js';
import filterProductController from '../controller/product/filterProduct.js';
import UserUploadMarketController from '../controller/product/userUploadMarket.js';
import getMarketController from '../controller/product/getUserMarket.js';
import marketRecordController from '../controller/product/marketRecord.js';
import { getAllUserMarkets, updateMarketStatus } from '../controller/product/userMarketController.js';
import { createBlogNote, getAllBlogNotes, updateBlogNote, deleteBlogNote } from '../controller/blogNoteController.js';
import submitReportController from '../controller/user/submitReportController.js';
import getUserReportsController from '../controller/user/getUserReportsController.js';
import { getAllReportsController, replyToReportController } from '../controller/user/adminReports.js';
import { getAllDataPads, createDataPad, updateDataPad, deleteDataPad } from '../controller/dataPadController.js';
import { createContactUsMessage, getAllContactUsMessages } from '../controller/contactUsController.js';
import { getAllUserDataPadsForAdmin } from '../controller/user/adminDataPadController.js';
import { getWalletBalance, getOtherUserWalletBalance } from '../controller/wallet/walletController.js';
import { createPaymentRequest, getAllPaymentRequests, getUserPaymentRequests, updatePaymentRequestStatus } from '../controller/wallet/paymentRequestController.js';
import { addBankAccount, getBankAccounts, deleteBankAccount, sendBankAddCode, verifyAndAddBankAccount } from '../controller/wallet/bankAccounController.js';
import { getUserTransactions } from '../controller/wallet/transactionsController.js';
import { getUserTransactionNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead, deleteAllNotifications, getUserReportNotifications, fetchReportDetails, getUnreadNotificationCount, getNewNotifications, getMarketNotifications } from '../controller/notifications/notificationsController.js';
import getReportDetailsController from '../controller/user/getReportDetailsController.js';
import userReplyReportController from '../controller/report/userReplyReportController.js';
import getReportChatController from '../controller/report/getReportChatController.js';
import sendChatMessageController from '../controller/report/sendChatMessageController.js';
import userProfileController from '../controller/userProfileController.js';
import getMarketByIdController from '../controller/product/getMarketByIDController.js';
import { getApprovedPostsController, submitNewPostController, deletePostController, addCommentController } from '../controller/user/communityController.js';
import { getPendingPostsController, approvePostController, rejectPostController } from '../controller/user/adminCommunityController.js';
import getUserPostsController from '../controller/user/getUserPostsController.js';
import { verifyEmailController } from '../controller/user/verifyEmailController.js';
import deleteUser from '../controller/user/deleteUser.js';
import { sendResetCode, verifyReset } from '../controller/user/resetController.js';
import { resendVerificationEmailController } from '../controller/user/resendVerificationEmailController.js';
import { getPaystackBanks, resolveBankAccount, } from '../controller/wallet/paystackController.js';
import { getUserEthWallet, saveEthWalletAddress, withdrawEth } from '../controller/wallet/ethWalletController.js';
import { createEthWithdrawalRequest, getAllEthWithdrawalRequests, getEthWithdrawalStatus, getSingleEthWithdrawalRequest, updateEthWithdrawalStatus } from '../controller/ethWithdrawalController.js';
import { generateSliderVerification } from "../utils/sliderVerification.js";
import getLastUserMarketStatusController from '../controller/product/getLastUserMarketStatusController.js';
import noCache from '../middleware/noCache.js';

const router = express.Router();

// Apply helmet middleware to all routes
router.use(helmet({
  frameguard: { action: 'deny' }, // Set X-Frame-Options to 'DENY'
}));

const cache = {};
const CACHE_TTL = 5 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function verifyApiKey(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== process.env.ETH_PRICE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
}

async function axiosGetWithRetry(url, options = {}, retries = 3, backoff = 500) {
  try {
    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    const status = error.response?.status;
    if ([401, 429].includes(status) || retries === 0) throw error;
    await sleep(backoff);
    return axiosGetWithRetry(url, options, retries - 1, backoff * 2);
  }
}

// Updated ETH price endpoint using CoinGecko API
router.get('/eth-price', async (req, res) => {
  const cacheKey = 'eth-price';
  const now = Date.now();

  // Check cache first
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return res.json(cache[cacheKey].data);
  }

  try {
    const url = new URL('https://api.coingecko.com/api/v3/simple/price');
    url.searchParams.set('ids', 'ethereum');
    url.searchParams.set('vs_currencies', 'usd,ngn');
    url.searchParams.set('include_24hr_change', 'true');
    url.searchParams.set('include_last_updated_at', 'true');

    const response = await axios.get(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Secxion-App/1.0',
      },
      timeout: 10000,
    });

    const data = response.data.ethereum;
    if (!data) throw new Error('Invalid response from CoinGecko');

    const result = {
      ethereum: {
        usd: data.usd,
        ngn: data.ngn,
        change_24h: data.usd_24h_change,
        last_updated: data.last_updated_at,
      },
      source: 'coingecko',
      timestamp: now,
    };

    // Cache the result for 10 seconds
    cache[cacheKey] = { data: result, expiry: now + 10000 };
    res.json(result);
  } catch (error) {
    console.error('[eth-price] Error fetching ETH price:', error.message);
    res.status(500).json({ error: 'Failed to fetch ETH price' });
  }
});

// Additional endpoint for detailed market data
router.get('/eth-market', async (req, res) => {
  try {
    const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
    url.searchParams.set('vs_currency', 'usd');
    url.searchParams.set('ids', 'ethereum');
    url.searchParams.set('price_change_percentage', '1h,24h,7d,30d');
    url.searchParams.set('order', 'market_cap_desc');
    url.searchParams.set('sparkline', 'true');

    const response = await axios.get(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Secxion-App/1.0',
      },
      timeout: 10000,
    });

    res.json(response.data[0]); // Return the first result (Ethereum)
  } catch (error) {
    console.error('[eth-market] Error fetching ETH market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch ETH market data' });
  }
});

// Additional endpoint for intraday chart data
router.get('/eth-chart', async (req, res) => {
  try {
    const url = new URL('https://api.coingecko.com/api/v3/coins/ethereum/market_chart');
    url.searchParams.set('vs_currency', 'usd');
    url.searchParams.set('days', '1');
    url.searchParams.set('interval', 'minute');

    const response = await axios.get(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Secxion-App/1.0',
      },
      timeout: 10000,
    });

    res.json(response.data); // Return the chart data
  } catch (error) {
    console.error('[eth-chart] Error fetching ETH chart data:', error.message);
    res.status(500).json({ error: 'Failed to fetch ETH chart data' });
  }
});

router.get('/usd-to-ngn', verifyApiKey, async (req, res) => {
  const cacheKey = 'usd-to-ngn';
  const now = Date.now();

  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return res.json(cache[cacheKey].data);
  }

  try {
    const { data } = await axiosGetWithRetry('https://open.er-api.com/v6/latest/USD');
    const rate = data?.rates?.NGN;
    if (!rate) throw new Error('NGN rate not found');
    const result = { rate };
    cache[cacheKey] = { data: result, expiry: now + CACHE_TTL };
    res.json(result);
  } catch (error) {
    console.error('[usd-to-ngn] Fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch USD to NGN rate' });
  }
});

router.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});

router.get("/slider-verification", (req, res) => {
  const { target, signature } = generateSliderVerification();
  res.json({ target, signature });
});

router.post("/signup", userSignUpController);
router.get('/verify-email', verifyEmailController);
router.post("/signin", userSignInController);
router.get("/user-details", authToken, noCache, userDetailsController);
router.get("/userLogout", authToken, noCache, userLogout);
router.post("/request-reset", sendResetCode); 
router.post("/confirm-reset", verifyReset); 
router.post("/resend-verification", resendVerificationEmailController);
router.post("/send-bank-code", authToken, sendBankAddCode);
router.post("/verify-add-bank", authToken, verifyAndAddBankAccount);

// Admin panel
router.get("/all-user", authToken, noCache, allUsers);
router.post("/update-user", authToken, noCache, updateUser);
router.get("/get-all-users-market", authToken, noCache, getAllUserMarkets);
router.post("/update-market-status/:id", updateMarketStatus);
router.get("/getAllDataForAdmin", authToken, noCache, getAllUserDataPadsForAdmin);
router.delete("/delete-user", deleteUser);

// Wallet balance
router.get("/wallet/balane/:userId", authToken, noCache, getOtherUserWalletBalance);

// ETH
router.post("/save-eth-address", authToken, noCache, saveEthWalletAddress);
router.get("/eth-wallet", authToken, noCache, getUserEthWallet);
router.post("/eth/withdrawal-request", authToken, noCache, createEthWithdrawalRequest);
router.get("/eth/get-withdrawal-status", authToken, noCache, getEthWithdrawalStatus);

// Admin routes
router.get("/eth-withdrawals", authToken, noCache, getAllEthWithdrawalRequests);
router.get("/eth-withdrawal/:requestId", authToken, noCache, getSingleEthWithdrawalRequest);
router.put("/eth-withdrawal-status/:requestId", authToken, noCache, updateEthWithdrawalStatus);

// Product
router.post("/upload-product", authToken, noCache, UploadProductController);
router.get("/get-product", getProductController);
router.post("/update-product", authToken, noCache, updateProductController);
router.get("/get-categoryProduct", getCategoryProduct);
router.post("/category-product", getCategoryWiseProduct);
router.post("/product-details", getProductDetails);
router.get("/search", SearchProduct);
router.post("/filter-product", filterProductController);

// User market
router.post("/upload-market", authToken, noCache, UserUploadMarketController);
router.get("/get-market", authToken, noCache, getMarketController);
router.get("/get-market/:marketId", authToken, noCache, getMarketByIdController);
router.get("/market-record", authToken, noCache, marketRecordController);
router.get('/last-market-status', authToken, noCache, getLastUserMarketStatusController);


// System blog
router.post("/create-blog", createBlogNote);
router.get("/get-blogs", getAllBlogNotes);
router.put("/update-blog/:id", updateBlogNote);
router.delete("/delete-blog/:id", deleteBlogNote);

// Reports
router.post("/submit-report", authToken, noCache, submitReportController);
router.get("/get-reports", authToken, noCache, getUserReportsController);
router.get("/all-reports", authToken, noCache, getAllReportsController);
router.post("/reply-report/:id", authToken, noCache, replyToReportController);
router.post("/reports/:id/reply", authToken, noCache, userReplyReportController);
router.get("/reports/admin/:id/chat", authToken, noCache, getReportChatController);
router.post("/reports/admin/:id/sendchat", authToken, noCache, sendChatMessageController);

// DataPad
router.get("/alldata", authToken, noCache, getAllDataPads);
router.post("/createdata", authToken, noCache, createDataPad);
router.put("/updatedata/:id", authToken, noCache, updateDataPad);
router.delete("/deletedata/:id", authToken, noCache, deleteDataPad);

// Contact us
router.post("/contact-us-message", createContactUsMessage);
router.get("/get-contact-us-messages", getAllContactUsMessages);

// Wallet
router.get("/wallet/balance", authToken, noCache, getWalletBalance);

// Payment request
router.post("/pr/create", authToken, noCache, createPaymentRequest);
router.get("/pr/getall", authToken, noCache, getAllPaymentRequests);
router.get("/pr/getuser", authToken, noCache, getUserPaymentRequests);
router.patch("/pr/update/:id", authToken, noCache, updatePaymentRequestStatus);

// Bank account
router.post("/ba/add", authToken, noCache, addBankAccount);
router.get("/ba/get", authToken, noCache, getBankAccounts);
router.delete("/ba/delete/:accountId", authToken, noCache, deleteBankAccount);
router.post('/verify-account', authToken, noCache, resolveBankAccount);
router.get('/banks', authToken, noCache, getPaystackBanks);

// Transactions
router.get("/transactions/get", authToken, noCache, getUserTransactions);

// Notifications
router.get("/tr-notifications/get", authToken, noCache, getUserTransactionNotifications);
router.patch("/tr-notifications/read/:notificationId", authToken, noCache, markNotificationAsRead);
router.delete("/tr-notifications/delete/:notificationId", authToken, noCache, deleteNotification);
router.put("/tr-notifications/read-all", authToken, noCache, markAllNotificationsAsRead);
router.delete("/tr-notifications/all", authToken, noCache, deleteAllNotifications);
router.get("/report/notifications", authToken, noCache, getUserReportNotifications);
router.get("/report-details/:reportId", authToken, noCache, fetchReportDetails);
router.get("/user-report-details/:reportId", authToken, noCache, getReportDetailsController);
router.get("/unread-notificationCount", authToken, noCache, getUnreadNotificationCount);
router.get("/get-new-notifications", authToken, noCache, getNewNotifications);
router.get("/get-market-notifications", authToken, noCache, getMarketNotifications);

// Profile

router.get("/profile", authToken, noCache, userProfileController.userProfileController);
router.get("/profile/bank-accounts", authToken, noCache, userProfileController.getUserBankAccountsController);
router.get("/profile/wallet-balance", authToken, noCache, userProfileController.getUserWalletBalanceController);
router.put("/profile/edit", authToken, noCache, userProfileController.editProfileController);


// Community
router.get("/posts/approved", getApprovedPostsController);
router.post("/posts/submit", authToken, noCache, submitNewPostController);
router.delete("/posts/:postId/delete", authToken, noCache, deletePostController);
router.post("/posts/:postId/comment", authToken, noCache, addCommentController);

// Admin community
router.get("/community/pending", authToken, noCache, getPendingPostsController);
router.put("/community/post/:postId/approve", authToken, noCache, approvePostController);
router.put("/community/post/:postId/reject", authToken, noCache, rejectPostController);
router.get("/myposts", authToken, noCache, getUserPostsController);

export default router;
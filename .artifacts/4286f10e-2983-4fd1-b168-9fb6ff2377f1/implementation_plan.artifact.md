# Phase 3 Implementation Plan: Performance & TWA Optimization

This phase focuses on optimizing the backend for better performance and ensuring the Android TWA (Trusted Web Activity) provides a seamless app-like experience.

## User Review Required

> [!TIP]
> **TWA Verification**: Since your app is already live at `www.secxion.com`, the most important step for the Play Store launch is ensuring the `assetlinks.json` file is accessible at `https://secxion.com/.well-known/assetlinks.json`. This removes the browser URL bar in the app.
> I have verified your `assetlinks.json` contains the correct release fingerprint.

## Proposed Changes

### 1. Backend Performance Optimization

#### [MODIFY] [backend/package.json](file:///Users/mac/secxionapp-clean/backend/package.json)
- Add `compression` middleware to reduce payload sizes.
- Add `morgan` for better HTTP request logging.

#### [MODIFY] [backend/index.js](file:///Users/mac/secxionapp-clean/backend/index.js)
- Implement `compression()` middleware.
- Add `morgan` logger for better monitoring in production.

#### [MODIFY] [backend/config/db.js](file:///Users/mac/secxionapp-clean/backend/config/db.js)
- Review and ensure critical indexes are present for common queries (e.g., `userId` on transactions, `email` on users).

### 2. TWA App Experience

#### [MODIFY] [frontend/public/manifest.json](file:///Users/mac/secxionapp-clean/frontend/public/manifest.json)
- Ensure all required icon sizes are present (verified).
- Set `display: standalone` (verified).

### 3. Database Indexes (Safety Check)
I will verify the following models have indexes on frequently queried fields:
- `userModel.js`: `email` (unique)
- `transactionModel.js`: `userId`
- `notificationModel.js`: `userId`, `isRead`

## Verification Plan

### Automated Tests
- Run `npm run dev` and verify no startup errors with new middleware.
- Use `curl -I` to verify `Content-Encoding: gzip` headers if compression is active.

### Manual Verification
- Verify `https://secxion.com/.well-known/assetlinks.json` is reachable via browser.
- Check backend logs to ensure `morgan` is outputting request data correctly.

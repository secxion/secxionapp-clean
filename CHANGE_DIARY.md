# Change Diary

## 2026-08-17

Commit: 908ecb9
Title: Harden CSRF flow and refine newsletter UX
Branch: main

### What went in

1. Global CSRF protection interceptor added for customer app requests.
   - File: frontend/src/utils/csrfFetchInterceptor.js
   - Behavior: auto-attach X-CSRF-Token for unsafe API methods, fetch token when missing, retry once on CSRF 403, keep credentials included.

2. Global CSRF protection interceptor added for admin app requests.
   - File: admin/utils/csrfFetchInterceptor.js
   - Behavior: same token attach and one-time retry strategy for admin API write requests.

3. Interceptor wiring added to customer app boot.
   - File: frontend/src/App.js
   - Behavior: installs CSRF interceptor at runtime using SummaryApi base URL.

4. Interceptor wiring added to admin app boot.
   - File: admin/main.jsx
   - Behavior: installs CSRF interceptor at runtime using admin API base URL.

5. Targeted CSRF hardening on withdrawal payment request flow.
   - File: frontend/src/Components/PaymentRequestForm.js
   - Behavior: fetches CSRF token if absent, sends X-CSRF-Token on /api/pr/create, retries once on CSRF validation failure.

6. ETH withdrawal UX confirmation order adjusted.
   - File: frontend/src/pages/EthWallet.js
   - Behavior: Request Transfer button moved below Transaction Summary; submit behavior preserved by linking button to form id.

### What went out

1. Reliance on ad-hoc per-screen CSRF handling as the only defense for write requests.
2. Missing CSRF header path for payment request creation (/api/pr/create).
3. Request Transfer button position before summary review in ETH withdrawal flow.

### Validation done

1. frontend build passed after changes.
2. admin build passed after changes.
3. No diagnostics errors in touched files at commit time.

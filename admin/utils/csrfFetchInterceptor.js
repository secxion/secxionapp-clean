const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_STORAGE_KEY = 'csrfToken';
const CSRF_ERROR_CODE = 'CSRF_VALIDATION_FAILED';

const normalizeBaseUrl = (baseURL = '') => String(baseURL || '').replace(/\/$/, '');

const buildTokenUrl = (baseURL = '') => {
  const normalizedBase = normalizeBaseUrl(baseURL);
  return normalizedBase ? `${normalizedBase}/api/csrf-token` : '/api/csrf-token';
};

const isUnsafeMethod = (method = 'GET') => !SAFE_METHODS.has(String(method).toUpperCase());

const shouldHandleRequest = (url, baseURL = '') => {
  try {
    const absolute = new URL(String(url), window.location.origin);
    if (!absolute.pathname.startsWith('/api/')) {
      return false;
    }

    if (absolute.pathname === '/api/csrf-token') {
      return false;
    }

    const normalizedBase = normalizeBaseUrl(baseURL);
    if (!normalizedBase) {
      return true;
    }

    const backendOrigin = new URL(normalizedBase, window.location.origin).origin;
    return absolute.origin === backendOrigin;
  } catch {
    return false;
  }
};

const mergeHeaders = (requestHeaders, overrideHeaders) => {
  const headers = new Headers(requestHeaders || {});
  new Headers(overrideHeaders || {}).forEach((value, key) => {
    headers.set(key, value);
  });
  return headers;
};

const isCsrfFailureResponse = async (response) => {
  if (response.status !== 403) {
    return false;
  }

  try {
    const payload = await response.clone().json();
    const code = String(payload?.code || '');
    const message = String(payload?.message || '');
    return code === CSRF_ERROR_CODE || /csrf|token|session/i.test(message);
  } catch {
    return false;
  }
};

export const installCsrfFetchInterceptor = ({ baseURL = '' } = {}) => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return () => {};
  }

  if (window.__secxionCsrfFetchInterceptorInstalled) {
    return window.__secxionCsrfFetchInterceptorTeardown || (() => {});
  }

  const originalFetch = window.fetch.bind(window);

  const fetchCsrfToken = async () => {
    const tokenUrl = buildTokenUrl(baseURL);
    const response = await originalFetch(tokenUrl, {
      method: 'GET',
      credentials: 'include',
    });

    const payload = await response.json().catch(() => ({}));
    const token = payload?.csrfToken || response.headers.get(CSRF_HEADER) || '';

    if (token) {
      localStorage.setItem(CSRF_STORAGE_KEY, token);
    }

    return token;
  };

  const interceptedFetch = async (input, init = {}) => {
    const requestUrl = input instanceof Request ? input.url : String(input);

    if (!shouldHandleRequest(requestUrl, baseURL)) {
      return originalFetch(input, init);
    }

    const requestMethod = String(
      init.method || (input instanceof Request ? input.method : 'GET'),
    ).toUpperCase();

    const sourceRequest = input instanceof Request ? input.clone() : null;
    const baseHeaders = sourceRequest ? sourceRequest.headers : undefined;
    const headers = mergeHeaders(baseHeaders, init.headers);

    let csrfToken = localStorage.getItem(CSRF_STORAGE_KEY) || '';

    if (isUnsafeMethod(requestMethod) && !headers.has(CSRF_HEADER)) {
      if (!csrfToken) {
        csrfToken = await fetchCsrfToken();
      }

      if (csrfToken) {
        headers.set(CSRF_HEADER, csrfToken);
      }
    }

    const requestInit = {
      ...init,
      method: requestMethod,
      headers,
      credentials: init.credentials || (sourceRequest?.credentials || 'include'),
    };

    const execute = () =>
      sourceRequest
        ? originalFetch(new Request(sourceRequest.clone(), requestInit))
        : originalFetch(input, requestInit);

    let response = await execute();

    const responseToken = response.headers.get(CSRF_HEADER);
    if (responseToken) {
      localStorage.setItem(CSRF_STORAGE_KEY, responseToken);
    }

    if (isUnsafeMethod(requestMethod) && (await isCsrfFailureResponse(response))) {
      const refreshedToken = await fetchCsrfToken();
      if (refreshedToken) {
        requestInit.headers.set(CSRF_HEADER, refreshedToken);
        response = await execute();

        const retryResponseToken = response.headers.get(CSRF_HEADER);
        if (retryResponseToken) {
          localStorage.setItem(CSRF_STORAGE_KEY, retryResponseToken);
        }
      }
    }

    return response;
  };

  window.fetch = interceptedFetch;
  window.__secxionCsrfFetchInterceptorInstalled = true;

  const teardown = () => {
    if (window.fetch === interceptedFetch) {
      window.fetch = originalFetch;
    }
    delete window.__secxionCsrfFetchInterceptorInstalled;
    delete window.__secxionCsrfFetchInterceptorTeardown;
  };

  window.__secxionCsrfFetchInterceptorTeardown = teardown;
  return teardown;
};

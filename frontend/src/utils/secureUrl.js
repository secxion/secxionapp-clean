const isString = (value) => typeof value === 'string';

export const ensureHttpsUrl = (url) => {
  if (!isString(url) || url.length === 0) {
    return url;
  }

  if (url.startsWith('http://')) {
    return `https://${url.slice(7)}`;
  }

  return url;
};

export default ensureHttpsUrl;

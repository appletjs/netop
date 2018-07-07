import inStandardBrowser from './inStandardBrowser';

let msie, urlParsingNode;
let originURL;

if (inStandardBrowser()) {
  msie = /(msie|trident)/i.test(navigator.userAgent);
  urlParsingNode = document.createElement('a');
  originURL = resolveURL(window.location.href);
}

/**
 * Parse a URL to discover it's components
 *
 * @param {String|URL|Object} url The URL to be parsed
 * @returns {Object|URL}
 */
function resolveURL(url) {
  if (url instanceof Request) {
    return resolveURL(url.url);
  }

  // url instance of URL or a like URL
  if (url.protocol || url.host) {
    return url;
  }

  try {
    return new URL(url);
  } catch (e) {
  }

  let href = url;

  if (msie) {
    // IE needs attribute set twice to normalize properties
    urlParsingNode.setAttribute('href', href);
    href = urlParsingNode.href;
  }

  urlParsingNode.setAttribute('href', href);

  // urlParsingNode provides the UrlUtils interface
  // http://url.spec.whatwg.org/#urlutils
  return {
    protocol: urlParsingNode.protocol,
    host: urlParsingNode.host
  };
}

/**
 * Determine if a URL shares the same origin as the current location
 *
 * @param {String} requestURL The URL to test
 * @returns {boolean} True if URL shares the same origin, otherwise false
 */
export default function isURLSameOrigin(requestURL) {
  // Non standard browser envs (web workers, react-native)
  // lack needed support.
  if (!requestURL || !inStandardBrowser()) {
    return true;
  }

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  const parsed = resolveURL(requestURL);

  return (
    parsed.protocol === originURL.protocol &&
    parsed.host === originURL.host
  );
}

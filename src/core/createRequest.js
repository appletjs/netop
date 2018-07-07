import createError from './createError';
import enhanceError from './enhanceError';
import inStandardBrowser from '../utils/inStandardBrowser';
import isURLSameOrigin from '../utils/isURLSameOrigin';
import readCookie from '../utils/readCookie';

const hasOwn = Object.prototype.hasOwnProperty;
const supportSearchParams = 'URLSearchParams' in self;
const supportBlob = 'FileReader' in self && 'Blob' in self && (function () {
  try {
    new Blob();
    return true;
  } catch (e) {
    return false;
  }
})();

const TextType = 'text/plain;charset=UTF-8';
const JsonType = 'application/json;charset=UTF-8';
const FormType = 'application/x-www-form-urlencoded;charset=UTF-8';

const METHODS = ['GET', 'DELETE', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS'];

const validators = {
  // The associated mode, available values of which are:
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/mode
  mode: createInArrayFunction(['same-origin', 'no-cors', 'cors', 'navigate']),
  // The available values area：
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Request/cache
  cache: createInArrayFunction(['default', 'no-store', 'reload', 'no-cache', 'force-cache', 'only-if-cached']),
  // The request credentials you want to use for the request:
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
  credentials: createInArrayFunction(['omit', 'same-origin', 'include'])
};

// An options object containing any custom settings that you want to apply to the request.
// https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
const initProps = ['method', 'body', 'mode', 'credentials', 'cache', 'referrer', 'integrity'/*, 'headers'*/];

function createInArrayFunction(array) {
  return function inArray(value) {
    return array.indexOf(value) > -1;
  };
}

function setContentTypeIfUnset(headers, value) {
  if (headers && !headers.has('Content-Type')) {
    headers.set('Content-Type', value);
  }
}

function validate(name, config) {
  if (!hasOwn.call(config, name)) return false;
  const value = config[name];
  if (!config.validity) return value != null;
  else if (hasOwn.call(validators, name)) return validators[name](value);
  else return value != null;
}

export default function createRequest(config) {
  const init = {};

  initProps.forEach(function (name) {
    if (validate(name, config)) {
      init[name] = config[name];
    }
  });

  const method = (init.method || 'get').toUpperCase();

  if (METHODS.indexOf(method) === -1) {
    throw createError(
      `Invalid method. Expected ${METHODS.join(', ')}, got ${method}.`,
      config
    );
  } else {
    init.method = method;
  }

  // Ensure method exist
  init.method = method;

  // Ensure headers exist
  if (!config.headers) {
    config.headers = {};
  }

  // Transform request data
  const headers = new Headers(config.headers);
  let body = init.body;

  if (body != null && (method === 'GET' || method === 'HEAD')) {
    throw createError('Request with GET/HEAD method cannot have body.', config);
  }

  if (typeof body === 'string') {
    setContentTypeIfUnset(headers, TextType);
  } else if (supportBlob && Blob.prototype.isPrototypeOf(body)) {
    // fixme: 这里值得思考，应该强制 Content-Type，比如上传文件等
    body.type && setContentTypeIfUnset(headers, body.type);
  } else if (supportSearchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
    setContentTypeIfUnset(headers, FormType);
  } else if (Object.prototype.toString.call(body) === '[object Object]') {
    setContentTypeIfUnset(headers, JsonType);
    body = JSON.stringify(body);
  }

  if (body != null) {
    init.body = body;
  }

  // HTTP Basic authentication
  if (hasOwn.call(config, 'auth') && typeof config.auth === 'object') {
    const {username = '', password = ''} = config.auth;
    headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
  }

  // Ensure headers exist
  init.headers = headers;

  let url;

  try {
    // Ensure request input
    url = typeof config.url === 'function'
      ? config.url(init, config)
      : config.url;
  } catch (e) {
    throw enhanceError(e, config);
  }

  // This is only done if running in a standard browser environment.
  // Specifically not if we're in a web worker, or react-native.
  if (inStandardBrowser()
    && hasOwn.call(config, 'xsrf')
    && typeof config.xsrf === 'object'
    && (init.credentials === 'include' || isURLSameOrigin(url))
  ) {
    const {cookieName, headerName} = config.xsrf;
    const xsrfValue = cookieName ? readCookie(cookieName) : undefined;

    // Add xsrf header
    if (xsrfValue && headerName) {
      headers.set(headerName, xsrfValue);
    }
  }

  if (!url) {
    throw createError('miss request uri', config);
  }

  return new Request(url, init);
}

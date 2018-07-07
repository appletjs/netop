'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Applet = _interopDefault(require('applet'));

var defaults = {
  // RequestInit
  // ========================================

  // 请求方法，`Netop`做了内部校验，有效值：
  // 'GET'、'DELETE'、'POST'、'PUT'、'PATCH'、'HEAD' 或 'OPTIONS'
  // method: '',

  // 任何你想加到请求中的头。
  // headers: {},

  // 任何你想加到请求中的body，可以是Blob, BufferSource, FormData, URLSearchParams, 或 USVString对象。
  // 注意： **GET** 和 **HEAD** 请求没有body。
  // body: '',

  // 请求的模式, 有效值 'same-origin'、'no-cors'、'cors' 或 'navigate'。
  // 浏览器默认值应该为 cors。但在Chrome中，
  // Chrome 47 之前的版本默认值为 no-cors ，自Chrome 47起，默认值为same-origin。
  // mode: '',

  // 想要在请求中使用的credentials，有效值: 'omit'、'same-origin' 或 'include'。
  // 浏览器默认值应该为 'omit'。但在Chrome中，
  // Chrome 47 之前的版本默认值为 'same-origin'，自Chrome 47起，默认值为 'include'。
  // 自 Firefox 43后, 若URL有credentials，Request() 会抛出TypeError , 例如http://user:password@example.com。
  // credential: '',

  // 请求中想要使用的缓存模式，有效值：'default'、'no-store'、'reload'、'no-cache'、'force-cache' 或 'only-if-cached'。
  // 具体说明查看：https://developer.mozilla.org/zh-CN/docs/Web/API/Request/cache
  // cache: '',

  // 对重定向处理的模式，有效值：'follow'、'error' 或 'manual'。
  // 在Chrome中，Chrome 47 之前的版本默认值为 manual ，自Chrome 47起，默认值为follow。
  // redirect: '',

  // 一个指定了 'no-referrer'、'client' 或一个 URL的 USVString 。
  // 浏览器的默认值是 'client'.
  // referrer: '',

  // 包括请求的 subresource integrity 值。
  // e.g. sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=
  // integrity: '',

  // 定义你想要fetch的资源。可以是下面两者之一:
  // 1、一个直接包含你希望fetch的资源的URL的 USVString
  // 2、一个 Request 对象.
  // url: '',

  // BasicAuthorization
  // ========================================

  // auth: {
  //   username: '',
  //   password: '',
  // },

  // XSRF
  // ========================================

  // xsrf: {
  //   cookieName: '',
  //   headerName: '',
  // },

  // API
  // ========================================

  // 值为true时，校验 RequestInit 参数；
  // 只有通过校验，才会被用于请求。
  validity: true,

  // 响应状态码校验
  validateStatus(status) {
    return status >= 200 && status < 300;
  },

  // 请求发送函数
  adapter: (request) => fetch(request)
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
function enhanceError(error, config, request, response) {
  error.config = config;
  error.request = request;
  error.response = response;
  return error;
}

/**
 * Create an Error with the specified message, config, error, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(message, config, request, response) {
  const error = new Error(message);
  return enhanceError(error, config, request, response);
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows netop to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function inStandardBrowser() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }

  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

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
function isURLSameOrigin(requestURL) {
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

function readCookie(name) {
  // Standard browser environment support document.cookie
  if (!inStandardBrowser()) return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return (match ? decodeURIComponent(match[3]) : null);
}

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

function createRequest(config) {
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

function createThrowable(netop) {
  return function (err) {
    if (!err || typeof err === 'string') {
      err = new Error(error || 'Unknown Error');
    } else if (!(err instanceof Error)) {
      err = new Error(String(err.message || err));
    }

    const rt = netop.runtime;
    if (err.config || !rt || !rt.config) {
      throw err;
    }

    throw enhanceError(err, rt.config, rt.request, rt.response);
  };
}

function cutoff(netop, flag) {
  if (netop[flag] != null) {
    throw createError(flag, netop.init);
  }
}

class Netop extends Applet {
  constructor(init = {}) {
    super();
    this.init = init;
    this.used = null;
    this.sent = null;
    this.runtime = null;
  }

  use(...fns) {
    cutoff(this, 'sent');
    super.use(...fns);
    return this;
  }

  with(url) {
    cutoff(this, 'sent');
    cutoff(this, 'used');

    this.init.url = url;

    // 收集运行时数据（config、request、response）
    const gather = (name, value) => {
      this.runtime[name] = value;
    };

    // init proxy
    const used = new Applet(true);
    used.onerror = createThrowable(this);
    this.used = true;

    this.use(function (config, next) {
      const request = createRequest(config);
      const handle = used.callback(() => request);

      gather('config', config);

      // 2、开始处理请求体
      return handle(function (request) {
        if (!(request instanceof Request)) {
          throw createError(
            'The request must be instance of Request',
            config, request
          );
        }

        gather('request', request);

        // 3、向服务器发起请求
        return config.adapter(request).then(function (response) {
          const {validateStatus} = config;
          const {status} = response;

          gather('response', response);

          // 4、开始处理响应实例
          if (!status || !validateStatus || validateStatus(status)) {
            return next().then(() => response);
          }

          throw createError(
            'Request failed with status code ' + status,
            config, request, response
          );
        });
      });
    });

    // rewrite 'this.use'
    this.use = function (...fns) {
      cutoff(this, 'sent');
      used.use(...fns);
      return this;
    };

    return this;
  }

  send(body) {
    cutoff(this, 'sent');

    this.init.body = body;

    // patch
    if (!this.used) {
      this.with();
    }

    // init proxy
    this.sent = true;

    // rewrite 'this.use'
    this.use = function () {
      cutoff(this, 'sent');
      return this;
    };

    const config = this.init;
    const handle = this.callback(() => config);

    this.onerror = createThrowable(this);
    this.runtime = {config};

    // 1、开始处理配置信息
    return handle(res => res);
  }
}

/**
 * Create a instance of Netop
 * @param {Object} [config]
 * @return {Netop}
 */
function netop(config) {
  const init = Object.assign({}, defaults);
  config && Object.assign(init, config);
  init.adapter = init.adapter || defaults.adapter;
  return new Netop(init);
}

netop.Netop = Netop;
netop.defaults = defaults;

netop.all = function all(...promises) {
  return Promise.all(promises);
};

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  netop.spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
netop.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

module.exports = netop;

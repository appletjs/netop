export default {
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

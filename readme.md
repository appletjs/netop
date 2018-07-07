## Netop

Netop 是一个基于 promise 的 HTTP 库，目前可用在浏览器端。


## Features

- 基于 fetch 实现
- 支持 Promise API
- 拦截请求和响应
- 客户端支持防御 XSRF


## netop([init])

是对 Netop 类的简单封装，方便调用。

#### 简单使用

```js
netop({url: '', method: ''}).send().then(function(response) {
  // response 是原生 Response 的实例
  // 你可以在这里验证 headers
  response.headers.has('X-Respond-Token');
  
  // 获取响应的 JSON 数据
  response.json().then(function(json) {});
  // 如果需要多次使用，可以 clone 这个 response
  response.clone().json().then(function(json) {});
  response.clone().text().then(function(text) {});
  response.clone().blob().then(function(blob) {});
}).catch(function(err) {
  // 错误处理，可能存在下面3个属性
  // err.config - 配置信息
  // err.request - 请求实例
  // err.response - 响应实例
})
```

#### 精细控制流程

```js
netop()// 返回 Netop 类的实例
  .use(function(config, next) {})// 使用配置拦截器
  .with('/path/to')// 拦截器类型分水岭
  .use(function(request, next) {})// 请求拦截器
  .send()// 发起请求（在其后面设置拦截器，会触发异常终止程序）
  .then(function(response) {})// 处理响应数据
  .catch(function(err) {});// 捕获异常（来自拦截器或请求触发的）
```


## Netop

#### constructor([init])

- init
  
    - url `<string>` | `<Function>` 可选，定义我们想要fetch的资源。可以是下面两者之一:
      
        > 1. 一个直接包含我们希望fetch的资源的URL的USVString;
        > 2. 一个 **Request** 对象.
    
    - body `<any>` 可选，任何你想加到请求中的body，可以是 **Blob**, **BufferSource**, **FormData**, **URLSearchParams**, 或 **USVString对象**。
      
        > 需要注意的是 **GET** 和 **HEAD** 请求没有 body（若指定了值，会在创建请求时触发异常）。

    - cache `<string>` 可选，请求中想要使用的缓存模式，具体说明查看 <https://developer.mozilla.org/zh-CN/docs/Web/API/Request/cache>，
    有效值：**`default`**、**`no-store`**、**`reload`**、**`no-cache`**、**`force-cache`** 或 **`only-if-cached`**。
    
    - redirect `<string>`  对重定向处理的模式。在Chrome中，Chrome 47 之前的版本默认值为 `manual` ，
    自Chrome 47起，默认值为 `follow`。有效值：**`follow`**、**`error`**、**`manual`**。
    
    - credentials `<string>` 可选，想要在请求中使用的credentials，浏览器默认值应该为 `omit`。
    但在Chrome中，Chrome 47 之前的版本默认值为 `same-origin`，自Chrome 47起，默认值为 `include`。
    自 Firefox 43后, 若URL有 credentials，Request() 会抛出TypeError, 例如 `http://user:password@example.com`。
    根据规范，三个有效值: **`omit`**、**`same-origin**、**`include`**。
                                  。
    - headers `<any>` 可选，任何你想加到请求中的头。

    - integrity `<string>` 可选，包括请求的 subresource integrity 值。
    e.g. `sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=`

    - method `<string>` 可选，请求方法，`Netop`做了内部校验，七个有效值：
    **`GET`**、**`DELETE`**、**`POST`**、**`PUT`**、**`PATCH`**、**`HEAD`** 或 **`OPTIONS`**
    
    - mode `<string>` 可选，请求的模式, 浏览器默认值应该为 cors。但在Chrome中，Chrome 47 之前的版本默认值为 `no-cors` ，
    自Chrome 47起，默认值为 `same-origin`。有效值：**`same-origin`**、**`no-cors`**、**`cors`** 或 **`navigate`**。
      
    - referrer `<string>` 可选，一个指定了 `no-referrer`、`client` 或一个 URL的 **USVString**。浏览器的默认值是 `client`.
    
    - auth `<Object>` 可选，Basic Authorization。
      
        - username `<string>` 可选，用户名。
        - password `<string>` 可选，密码。
    
    - xsrf `<Object>`
    
        - cookieName `<string>` 可选，保存在cookie中的值
        - headerName `<string>` 可选，将保存在cookie中的值映射到请求体的headers上面
    
    - validity `<boolean>` 可选，默认值 `true`，值为true时，校验 RequestInit 参数；只有通过校验，才会被用于请求。
    - validateStatus `<Function>` 可选，验证响应实例的状态码是否有效。
    - adapter `<Function>` 可选，发起请求的函数，默认值是 **`window.fetch`**。


#### use(...fns): this

使用拦截器（也可以称作中间件），具体参考中间件框架 **[applet](https://appletjs.github.io/applet/index.html)**。

- fns `<Function[]>`


#### with(url): this

该方法用于区分 use 的拦截器类型，即 use 的拦截器用于处理 config 还是 request。

- url `<string>` | `<Function>` 可选，请求路径。

```js
netop({})
  // 使用配置拦截器
  .use(function(config, next) {
    // 修改配置信息
    config.mode = 'no-cors';
    config.integrity = 'sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=';
    return next();
  })
  .with('/user?id=1234')// 拦截器类型分水岭
  .use(function(request, next) {
    // request 是 Request 的实例
    if (request.headers.get('x-access-token') !== 'cached access token') {
      throw new Error('Token失效');
    }
    return next();
  })
  .send()// 发起请求）
  .then(response => response.json())
  .then(function(result = {}) {
    if (result.code !== 0) {
      throw new Error(result.message || 'error message');
    } 
  })
  .catch(function(err) {});// 捕获异常
```

#### send([body]): Promise<Response>

发送数据到服务器，调用该方法后，就不能够再使用拦截器了；
该方法返回一个 Promise<Response> 实例；

- body `<any>` 可选，提交的数据


## netop.all(...promises)

- `Array<Promise<any>>` promises

## netop.spread(callback)

- `function` callback


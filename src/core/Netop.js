import Applet from 'applet';
import createError from './createError';
import createRequest from './createRequest';
import createThrowable from './createThrowable';

function cutoff(netop, flag) {
  if (netop[flag] != null) {
    throw createError(flag, netop.init);
  }
}

export default class Netop extends Applet {
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

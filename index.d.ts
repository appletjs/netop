declare function netop(config?: netop.NetopConfig): netop.Netop;

declare namespace netop {
  interface UrlGenerator {
    (requestInit: RequestInit, config: NetopConfig): string;
  }

  export type NetopBody = Blob
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array
    | DataView
    | ArrayBuffer
    | FormData
    | string
    | null;

  interface BasicAuthorization {
    username: string;
    password: string;
  }

  interface XSRF {
    cookieName?: string;
    headerName?: string;
  }

  interface FetchAdapter {
    (input: Request): Promise<Response>;
  }

  interface NetopConfig {
    url?: string | UrlGenerator;

    // RequestInit

    method?: string;
    headers?: HeadersInit;
    body?: NetopBody;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;

    // XSRF
    xsrf: XSRF;

    // Auth
    auth?: BasicAuthorization;

    // API
    validity?: boolean;
    validateStatus?: (status: number) => boolean;
    adapter?: FetchAdapter;
  }

  type NetopError = Error & {
    config: NetopConfig;
    request?: Request;
    response?: Response;
  };

  class Netop extends Applet {
    constructor(init: NetopConfig);

    with(url?: string | UrlGenerator): this;

    send(body?: NetopBody): Promise<Response | any>;
  }

  interface SpreadWrapper<T> {
    (arr: any[]): T;
  }

  function all(...promises: Array<Promise<any>>): Promise<any[]>;

  function spread<T = any>(callback: Function): SpreadWrapper<T>;
}

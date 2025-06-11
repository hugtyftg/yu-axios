export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH';
export type IHeader = Record<string, any>;
export type Params = Record<string, any>;
export type CustomAdapter = (config: AxiosRequestConfig) => AxiosPromise;
export type BuiltInAdapter = 'xhr' | 'fetch' | 'http';
export type Adapter = BuiltInAdapter | CustomAdapter;
export interface AxiosRequestConfig {
  method?: Method;
  // 不一定需要，因为可能某个请求的目的是baseURL
  url?: string;
  baseURL?: string;
  data?: unknown;
  params?: Params;
  headers?: IHeader | null;
  timeout?: number;
  adapter?: Adapter;
  responseType?: XMLHttpRequestResponseType;
  cancelToken?: CancelToken;
  validateStatus?: (status: number) => boolean;
  paramsSerializer?: (params: Params) => string;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: IHeader | null;
  config: AxiosRequestConfig;
  request: XMLHttpRequest | null;
}

export const ERROR_CODES = {
  ERR_BAD_OPTION_VALUE: 'ERR_BAD_OPTION_VALUE',
  ERR_BAD_OPTION: 'ERR_BAD_OPTION',
  ECONNABORTED: 'ECONNABORTED',
  ETIMEDOUT: 'ETIMEDOUT',
  ERR_NETWORK: 'ERR_NETWORK',
  ERR_FR_TOO_MANY_REDIRECTS: 'ERR_FR_TOO_MANY_REDIRECTS',
  ERR_DEPRECATED: 'ERR_DEPRECATED',
  ERR_BAD_REQUEST: 'ERR_BAD_REQUEST',
  ERR_BAD_RESPONSE: 'ERR_BAD_RESPONSE',
  ERR_CANCELED: 'ERR_CANCELED',
  ERR_NOT_SUPPORT: 'ERR_NOT_SUPPORT',
  ERR_INVALID_URL: 'ERR_INVALID_URL',
};
export type AxiosErrorCode = keyof typeof ERROR_CODES;

export interface IAxiosError extends Error {
  isAxiosError: boolean;
  config?: AxiosRequestConfig | null;
  code?: AxiosErrorCode | null;
  request?: XMLHttpRequest | null;
  response?: AxiosResponse | null;
}

// Axios请求返回的Promise的约束
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export interface Axios {
  defaults: AxiosRequestConfig;
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
  getUri: (config: AxiosRequestConfig) => string;
  request: <T = any>(
    url: string | AxiosRequestConfig,
    config: AxiosRequestConfig,
  ) => AxiosPromise<T>;
}
// 最外层暴露的作为静态实例使用的axios
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

  // 无需data
  get: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
  head: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
  options: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
  // 需要data
  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
  patch: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
  // 需要data且请求头Content-Type为multipart/form-data
  postForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
  putForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
  patchForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
}

export interface AxiosStatic extends AxiosInstance {
  create: (config?: AxiosRequestConfig) => AxiosInstance;
  all: <T = any>(promises: Array<Promise<T> | T>) => Promise<T[]>;
  spread: <T, R>(callback: (...args: T[]) => R) => (arr: T[]) => R;
  isCancel: (thing: unknown) => thing is CancelError;
  Axios: AxiosClassStatic;
  CancelToken: CancelTokenStatic;
  CancelError: CancelErrorStatic;
}

export interface AxiosClassStatic {
  new (config: AxiosRequestConfig): Axios;
}

/* 实现拦截器：执行链，多个请求拦截器--> 请求 --> 响应 --> 多个响应拦截器 */
export interface AxiosInterceptorManager<T> {
  use: (resolved: ResolvedFn<T>, rejected?: RejectedFn) => number;
  eject: (id: number) => void;
}
export type ResolvedFn<T> = (val: T) => T | Promise<T>;
export type RejectedFn = (err: any) => any;
export interface PromiseChainNode<T> {
  // 可能是resolve函数，也可能是dispatchRequest
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig | AxiosResponse) => AxiosPromise);
  rejected?: RejectedFn;
}
export type PromiseChain<T> = PromiseChainNode<T>[];

/* 取消请求 */
export interface CancelToken {
  promise: Promise<CancelError>;
  reason?: CancelError;
  throwIfRequested: () => void;
  source: () => CancelTokenSource;
  subscribe: (listener: (reason?: CancelError) => void) => void;
  unsubscribe: (listener: (reason?: CancelError) => void) => void;
}

export interface Canceler {
  (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): void;
}

export interface CancelExecutor {
  (cancel: Canceler): void;
}

export interface CancelTokenSource {
  token: CancelToken;
  cancel: Canceler;
}
export interface CancelTokenStatic {
  new (executor: CancelExecutor): CancelToken;
}

export interface CancelError {
  message?: string;
}

export interface CancelErrorStatic {
  new (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): CancelError;
}

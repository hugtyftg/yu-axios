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

export interface AxiosRequestConfig {
  method: Method;
  // 不一定需要，因为可能某个请求的目的是baseURL
  url?: string;
  data?: any;
  params?: Params;
  headers?: IHeader | null | undefined;
  validateStatus?: (status: number) => boolean;
  baseURL?: string;
  paramsSerializer?: (params: Params) => string;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: IHeader | null | undefined;
  config: AxiosRequestConfig;
  request: XMLHttpRequest;
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
  request?: XMLHttpRequest;
  response?: AxiosResponse;
}

// Axios请求返回的Promise的约束
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export interface IAxios {
  defaults: AxiosRequestConfig;
  request: <T = any>(config: AxiosRequestConfig) => AxiosPromise<T>;
}

export interface AxiosInstance extends IAxios {}

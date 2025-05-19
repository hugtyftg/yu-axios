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
  method?: Method;
  // 不一定需要，因为可能某个请求的目的是baseURL
  url?: string;
  data?: any;
  params?: Params;
  headers?: IHeader;
  validateStatus?: (status: number) => boolean;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: IHeader;
  config: AxiosRequestConfig;
  request: XMLHttpRequest;
}

// Axios请求返回的Promise的约束
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export interface IAxios {
  defaults: AxiosRequestConfig;
  request: <T = any>(config: AxiosRequestConfig) => AxiosPromise<T>;
}

export interface AxiosInstance extends IAxios {}

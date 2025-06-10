import type {
  AxiosInterceptorManager,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Axios as IAxios,
  Method,
} from '@/types';
import { transformUrl } from '@/helpers/url';
import { dispatchRequest } from './dispatchRequest';
import InterceptorManager from './InterceptorManager';
import mergeConfig from './mergeConfig';

export class Axios implements IAxios {
  defaults: AxiosRequestConfig;
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig;
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>(),
    };
    // 绑定不穿Data的方法，如get
    this._eachMethodNoData();
    // 绑定传入Data的方法，如post
    this._eachMethodWithData();
  }

  request(url: string | AxiosRequestConfig, config: AxiosRequestConfig = {}): AxiosPromise {
    // return dispatchRequest({
    //   ...this.defaults,
    //   ...config,
    // });
    if (typeof url === 'string') {
      config.url = url;
    } else {
      config = url;
    }
    config = mergeConfig(this.defaults, config);
    return dispatchRequest(config);
  }

  getUri(config: AxiosRequestConfig): string {
    return transformUrl(mergeConfig(this.defaults, config));
  }

  private _eachMethodNoData() {
    (['get', 'delete', 'head', 'options'] as Method[]).forEach(method => {
      (Axios.prototype as Record<string, any>)[method] = (
        url: string,
        config: AxiosRequestConfig,
      ) => this.request(mergeConfig(config, { method, url }));
    });
  }

  private _eachMethodWithData() {
    (['post', 'put', 'patch'] as Method[]).forEach(method => {
      const genHTTPMethod =
        (isForm: boolean) => (url: string, data: unknown, config: AxiosRequestConfig) =>
          this.request(
            mergeConfig(config, {
              url,
              method,
              data,
              headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
            }),
          );
      // postForm等方法有特殊的请求头Content-Type
      (Axios.prototype as Record<string, any>)[method] = genHTTPMethod(false);
      (Axios.prototype as Record<string, any>)[`${method}Form`] = genHTTPMethod(true);
    });
  }
}

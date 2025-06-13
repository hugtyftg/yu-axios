import type {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Axios as IAxios,
  Method,
  PromiseChain,
} from '@/types';
import { transformUrl } from '@/helpers/url';
import { dispatchRequest } from './dispatchRequest';
import InterceptorManager from './InterceptorManager';
import mergeConfig from './mergeConfig';

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>;
  response: InterceptorManager<AxiosResponse>;
}
export class Axios implements IAxios {
  defaults: AxiosRequestConfig;
  interceptors: Interceptors;

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
    if (typeof url === 'string') {
      config.url = url;
    } else {
      config = url;
    }
    config = mergeConfig(this.defaults, config);

    const promiseChain: PromiseChain<any> = [
      {
        resolved: dispatchRequest,
        rejected: undefined,
      },
    ];
    // 遍历request、response拦截器数组中的方法，添加到promiseChain中
    this.interceptors.request.forEach(interceptor => promiseChain.unshift(interceptor));
    this.interceptors.response.forEach(interceptor => promiseChain.push(interceptor));

    let promise = Promise.resolve(config);

    while (promiseChain.length) {
      const { resolved, rejected } = promiseChain.shift()!;
      promise = promise.then(resolved, rejected);
    }

    return promise as AxiosPromise;
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

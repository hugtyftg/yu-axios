import type { AxiosPromise, AxiosRequestConfig, IAxios } from '@/types';
import { dispatchRequest } from './dispatchRequest';
import mergeConfig from './mergeConfig';

export class Axios implements IAxios {
  defaults: AxiosRequestConfig;
  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig;
  }

  request(config: AxiosRequestConfig): AxiosPromise {
    // return dispatchRequest({
    //   ...this.defaults,
    //   ...config,
    // });
    config = mergeConfig(this.defaults, config);
    return dispatchRequest(config);
  }
}

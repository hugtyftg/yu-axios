import type { AxiosRequestConfig, AxiosResponse, IAxios } from '@/types';
import { dispatchRequest } from './dispatchRequest';

export class Axios implements IAxios {
  defaults: AxiosRequestConfig;
  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig;
  }

  request(config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return dispatchRequest({
      ...this.defaults,
      ...config,
    });
  }
}

import { kindOf } from '@/helpers';
import { AxiosPromise, AxiosRequestConfig } from '@/types';

// eslint-disable-next-line node/prefer-global/process
const isHttpAdapter: boolean = typeof process !== undefined && kindOf(process) === 'process';

export default isHttpAdapter &&
  function httpAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {});
  };

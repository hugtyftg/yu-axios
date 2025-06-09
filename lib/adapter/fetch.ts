import { AxiosPromise, AxiosRequestConfig } from '@/types';

const isFetchAdapter = typeof fetch === 'function';

export default isFetchAdapter &&
  function fetchAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      // TODO
    });
  };

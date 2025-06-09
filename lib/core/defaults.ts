import type { AxiosRequestConfig } from '@/types';

export const defaultConfig: AxiosRequestConfig = {
  method: 'GET',
  timeout: 0,
  adapter: 'xhr',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
};

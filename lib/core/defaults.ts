import { AxiosRequestConfig } from '@/types';

export const defaultConfig: AxiosRequestConfig = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
};

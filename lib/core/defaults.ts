import type { AxiosRequestConfig } from '@/types';
import { isPlainObject } from '@/helpers';
import { isString } from '@/helpers/is';
import { processRequestHeaders } from '@/helpers/headers';

export const defaults: AxiosRequestConfig = {
  method: 'GET',
  timeout: 0,
  adapter: 'xhr',
  headers: {
    common: {
      'Content-Type': 'application/json',
    },
  },
  transformRequest: [
    function (data, headers) {
      processRequestHeaders(headers, data);
      data = processRequestData(data);
      return data;
    },
  ],
  transformResponse: [
    function (data) {
      data = processResponseData(data);
      return data;
    },
  ],
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
};

function processRequestData(data: unknown) {
  if (isPlainObject(data)) {
    return JSON.stringify(data);
  }
  return data;
}

function processResponseData(data: unknown) {
  if (isString(data)) {
    try {
      return JSON.parse(data as string);
    } catch (e) {
      // do nothing
      throw new Error('Invalid response JSON data');
    }
  }
  return data;
}

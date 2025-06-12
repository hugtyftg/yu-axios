import type { AxiosRequestConfig, IHeader } from '@/types';
import { isPlainObject } from '@/helpers';
import { isString } from '@/helpers/is';

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

function processRequestHeaders(headers: IHeader | null | void, data: unknown) {
  // 格式化Content-Type
  normalizeHeaderName(headers, 'Content-Type');
  // 如果有data，则1.转为字符串 2.默认设置Content-Type为application/json
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }
  }
}

function processRequestData(data: unknown) {
  if (isPlainObject(data)) {
    return JSON.stringify(data);
  }
  return data;
}

function normalizeHeaderName(headers: IHeader | null | void, normalizedName: string) {
  if (!headers) {
    return;
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
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

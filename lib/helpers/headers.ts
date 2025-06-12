import { IHeader, Method } from '@/types';
import { deepMerge, isPlainObject } from '.';

export function flattenHeaders(
  headers: IHeader | null | undefined,
  method: Method,
): IHeader | null | undefined {
  if (!headers) {
    return headers;
  }
  // 1.打平 headers，优先级从低到高
  // TODO验证优先级
  headers = deepMerge(headers.common, headers[method], headers);
  // 2. 清理冗余属性
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];
  methodsToDelete.forEach(method => {
    delete headers![method];
  });
  return headers;
}

// 工具函数：预处理请求头
export function processRequestHeaders(headers: IHeader | null | void, data: unknown) {
  // 格式化Content-Type
  normalizeHeaderName(headers, 'Content-Type');
  // 如果有data，则1.转为字符串 2.默认设置Content-Type为application/json
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }
  }
}

// 工具函数：规范化header key
export function normalizeHeaderName(headers: IHeader | null | void, normalizedName: string) {
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

const ignoreDuplicateOf = new Set([
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent',
]);

// 将request.getAllResponseHeaders()返回的headers字符串解析成对象
export function parseRawResponseHeaders(rawHeaders: string): IHeader {
  const result = Object.create(null);
  if (!rawHeaders) {
    return result;
  }
  rawHeaders.split('\n').forEach(line => {
    let [key, ...values] = line.split(':');
    key = key.trim().toLowerCase();
    if (!key || ignoreDuplicateOf.has(key)) {
      return;
    }
    const value = values.join(':').trim();
    if (key === 'set-cookie') {
      // set-cookie的值是cookie数组
      result[key] = result[key] ? [...result[key], value] : [value];
    } else {
      // 某些key有多个取值
      result[key] = result[key] ? `${result[key]}, ${value}` : value;
    }
  });
  return result;
}

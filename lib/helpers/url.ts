import { AxiosRequestConfig } from '@/types';
import { isAbsoluteURL, isArray, isDate, isNil, isPlainObject, isURLSearchParams } from './is';

export function transformUrl(config: AxiosRequestConfig): string {
  const { url, params, baseURL, paramsSerializer } = config;
  // 将url和baseurl拼接
  const fullPath = baseURL && isAbsoluteURL(url!) ? combineURL(baseURL, url!) : url;
  // 将参数写入成querystring形式
  return buildURL(fullPath!, params, paramsSerializer);
}

function combineURL(baseURL: string, relativeURL: string): string {
  return relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL;
}

function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string): string {
  if (isNil(params)) {
    return url;
  }
  let serializedParams: string;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    const parts: string[] = [];
    Object.keys(params).forEach(key => {
      const val = params[key];
      if (isNil(val)) return;
      if (isArray(val)) {
        // key[]= 中的方括号是约定俗成的数组标识符，用于告知后端该参数应被解析为数组
        // 例如参数 { foo: [1, 2] } 会被转换为 foo[]=1&foo[]=2
        val.forEach(v => {
          parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(formatURLParam(v))}`);
        });
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(formatURLParam(val))}`);
      }
    });
  }
  return '';
}

// 将参数中的日期类型和plain对象类型转换为字符串类型
function formatURLParam(param: any): string {
  if (isDate(param)) {
    return param.toISOString();
  } else if (isPlainObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

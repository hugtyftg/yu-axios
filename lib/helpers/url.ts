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
  if (isNil(params)) return url; // 无参数直接返回

  let serializedParams: string;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params); // 自定义序列化函数
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString(); // 原生 URLSearchParams 对象
  } else {
    const parts: string[] = [];
    Object.keys(params).forEach(key => {
      const val = params[key];
      if (isNil(val)) return; // 跳过空值

      // 数组处理：key[]=value1&key[]=value2
      if (isArray(val)) {
        val.forEach(v => {
          parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(formatURLParam(v))}`);
        });
      }
      // 基础类型：key=value
      else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(formatURLParam(val))}`);
      }
    });
    serializedParams = parts.join('&'); // 合并为查询字符串
  }

  // 将查询字符串拼接到 URL
  return url + (url.includes('?') ? '&' : '?') + serializedParams;
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

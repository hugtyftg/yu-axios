import { AxiosRequestConfig, AxiosResponse, AxiosTransformer } from '@/types';
import { defaults } from './defaults';

/**
 * 对数据进行链式转换：接受一组 AxiosTransformer 函数，并依次对 data 进行处理。
 * 请求阶段：使用 transformRequest
 * 响应阶段：使用 transformResponse
 */
export default function transformData(
  this: AxiosRequestConfig,
  fns: AxiosTransformer[],
  // 在request前不需要
  response?: AxiosResponse,
) {
  const config = this ?? defaults;
  const context = response ?? config;
  const headers = config.headers;
  let data = context.data;
  fns.forEach(fn => {
    data = fn.call(config, data, headers, response ? response.status : void 0);
  });
}

import type {
  Adapter,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosTransformer,
} from '@/types';
import adapters from '@/adapter';
import { flattenHeaders } from '@/helpers/headers';
import { isArray } from '@/helpers/is';
import { transformUrl } from '@/helpers/url';
import { defaults } from './defaults';
import transformData from './transformData';

export function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 发送前检查是否已经被取消
  config.cancelToken?.throwIfRequested();
  processConfig(config);
  const adapter = adapters.getAdapter(config?.adapter || (defaults.adapter as Adapter));
  return adapter(config).then(response => transformResponseData(response));
}

// 对url、headers、data预处理
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config);
  config.data = transformRequestData(config);
  config.data = config.headers = flattenHeaders(config, config.method ?? 'GET');
}

// transformer: 发送请求前对headers和data进行预处理
function transformRequestData(config: AxiosRequestConfig) {
  const data = transformData.call(
    config,
    isArray(config.transformRequest)
      ? (config.transformRequest as AxiosTransformer[])
      : [config.transformRequest],
  );
  return data;
}

// transformer: 接收响应数据进行预处理
function transformResponseData(response: AxiosResponse) {
  response.data = transformData.call(
    response,
    isArray(response.config.transformResponse)
      ? (response.config.transformResponse as AxiosTransformer[])
      : [response.config.transformResponse],
    response,
  );
  return response;
}

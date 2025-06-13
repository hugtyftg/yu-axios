import type {
  Adapter,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosTransformer,
} from '@/types';
import adapters from '@/adapter';
import CancelError from '@/cancel/CancelError';
import isCancel from '@/cancel/isCancel';
import { flattenHeaders } from '@/helpers/headers';
import { isArray } from '@/helpers/is';
import { transformUrl } from '@/helpers/url';
import { AxiosError } from './AxiosError';
import { defaults } from './defaults';
import transformData from './transformData';

export function dispatchRequest(config: AxiosRequestConfig) {
  // 发送前检查是否已经被取消
  config.cancelToken?.throwIfRequested();
  processConfig(config);
  const adapter = adapters.getAdapter(config?.adapter || (defaults.adapter as Adapter));
  return adapter(config)
    .then(response => transformResponseData(response))
    .catch((err: AxiosError) => {
      if (isCancel(err)) {
        transformErrorData(config, err);
      }
      Promise.reject(err) as AxiosPromise<any>;
    });
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
    response.config,
    isArray(response.config.transformResponse)
      ? (response.config.transformResponse as AxiosTransformer[])
      : [response.config.transformResponse],
    response,
  );
  return response;
}
// transformer: 响应出现error后的处理
function transformErrorData(config: AxiosRequestConfig, error: AxiosError) {
  throwIfCancelRequested(config);
  if (error && error.response) {
    error.response.data = transformData.call(
      config,
      isArray(config.transformResponse)
        ? (config.transformResponse as AxiosTransformer[])
        : [config.transformResponse],
      error.response,
    );
  }
}

function throwIfCancelRequested(config: AxiosRequestConfig) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal) {
    if (config.signal.aborted) throw new CancelError('Cancel', config);
  }
}

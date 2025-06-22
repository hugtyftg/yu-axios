import CancelError from '@/cancel/CancelError';
import { AxiosError } from '@/core/AxiosError';
import transformData from '@/core/transformData';
import { AxiosRequestConfig, AxiosResponse, AxiosTransformer } from '@/types';
import { isArray } from './is';

// transformer: 发送请求前对headers和data进行预处理
export function transformRequestData(config: AxiosRequestConfig) {
  const data = transformData.call(
    config,
    isArray(config.transformRequest)
      ? (config.transformRequest as AxiosTransformer[])
      : [config.transformRequest],
  );
  return data;
}

// transformer: 接收响应数据后对response进行预处理
export function transformResponseData(response: AxiosResponse) {
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
export function transformResponseError(config: AxiosRequestConfig, error: AxiosError) {
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

export function throwIfCancelRequested(config: AxiosRequestConfig) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal) {
    if (config.signal.aborted) throw new CancelError('Cancel', config);
  }
}

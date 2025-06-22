import type { Adapter, AxiosPromise, AxiosRequestConfig } from '@/types';
import adapters from '@/adapter';
import isCancel from '@/cancel/isCancel';
import { flattenHeaders } from '@/helpers/headers';
import {
  transformRequestData,
  transformResponseData,
  transformResponseError,
} from '@/helpers/transform';
import { transformUrl } from '@/helpers/url';
import { AxiosError } from './AxiosError';
import { defaults } from './defaults';

export function dispatchRequest(config: AxiosRequestConfig) {
  // 发送前检查是否已经被取消
  config.cancelToken?.throwIfRequested();
  processConfig(config);
  const adapter = adapters.getAdapter(config?.adapter || (defaults.adapter as Adapter));
  return adapter(config)
    .then(response => transformResponseData(response))
    .catch((err: AxiosError) => {
      if (isCancel(err)) {
        transformResponseError(config, err);
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

import type { Adapter, AxiosPromise, AxiosRequestConfig } from '@/types';
import adapters from '@/adapter';
import { flattenHeaders } from '@/helpers/headers';
import { transformUrl } from '@/helpers/url';
import { defaults } from './defaults';

export function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 发送前检查是否已经被取消
  config.cancelToken?.throwIfRequested();
  processConfig(config);
  const adapter = adapters.getAdapter(config?.adapter || (defaults.adapter as Adapter));
  return adapter(config);
}

// 对url、headers、data预处理
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config);
  config.headers = flattenHeaders(config, config.method ?? 'GET');
}

import { isArray, isFunction, isString } from '@/helpers/is';
import { Adapter, AxiosPromise, AxiosRequestConfig, BuiltInAdapter, CustomAdapter } from '@/types';
import fetchAdapter from './fetch';
// import httpAdapter from './http';
import xhrAdapter from './xhr';

const knownAdapters: Record<string, ((config: AxiosRequestConfig) => AxiosPromise) | false> = {
  xhr: xhrAdapter,
  fetch: fetchAdapter,
  // http: httpAdapter,
};

export default {
  adapters: knownAdapters,
  getAdapter(adapters: Array<Adapter> | Adapter) {
    adapters = isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter: Adapter | undefined;
    let adapter: ((config: AxiosRequestConfig) => AxiosPromise) | false | undefined;
    // 遍历adapters，找到第一个支持的adapter
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      if (
        (adapter = isString(nameOrAdapter)
          ? knownAdapters[nameOrAdapter as BuiltInAdapter]
          : (nameOrAdapter as CustomAdapter))
      ) {
        break;
      }
    }
    // 如果没有找到支持的adapter，抛出错误
    if (!adapter) {
      if (adapter === false) {
        throw new Error(`adapter ${nameOrAdapter} is not supported`);
      }
      throw new Error('adapter is not supported');
    }
    // 如果adapter不是函数，抛出错误
    if (!isFunction(adapter)) {
      throw new Error('adapter must be a function');
    }

    return adapter;
  },
};

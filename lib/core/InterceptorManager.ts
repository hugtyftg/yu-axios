import {
  AxiosInterceptorManager,
  AxiosInterceptorRejectedFn,
  AxiosInterceptorResolvedFn,
} from '@/types';

export default class InterceptorManager<T> implements AxiosInterceptorManager<T> {
  interceptors: Array<{
    resolved: AxiosInterceptorResolvedFn<T>;
    rejected?: AxiosInterceptorRejectedFn;
  } | null> = [];

  constructor() {
    this.interceptors = [];
  }

  // 注册一个interceptor，并返回interceptor的索引作为id
  use(resolved: AxiosInterceptorResolvedFn<T>, rejected?: AxiosInterceptorRejectedFn) {
    this.interceptors.push({ resolved, rejected });
    return this.interceptors.length - 1;
  }

  // 移除指定 ID interceptor
  eject(id: number) {
    this.interceptors[id] = null;
  }
}

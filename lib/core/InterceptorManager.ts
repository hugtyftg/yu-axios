import { AxiosInterceptorManager, RejectedFn, ResolvedFn } from '@/types';

interface Interceptor<T> {
  resolved: ResolvedFn<T>;
  rejected?: RejectedFn;
}

export default class InterceptorManager<T> implements AxiosInterceptorManager<T> {
  interceptors: Array<Interceptor<T> | null> = [];

  constructor() {
    this.interceptors = [];
  }

  // 注册一个interceptor，并返回interceptor的索引作为id
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn) {
    this.interceptors.push({ resolved, rejected });
    return this.interceptors.length - 1;
  }

  // 移除指定 ID interceptor
  eject(id: number) {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  // 遍历request、response拦截器数组中的方法，添加到promiseChain中
  forEach(cb: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        cb(interceptor);
      }
    });
  }
}

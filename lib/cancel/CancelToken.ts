import {
  AxiosRequestConfig,
  Canceler,
  CancelExecutor,
  CancelTokenPromiseResolver,
  CancelToken as ICancelToken,
} from '@/types';
import CancelError from './CancelError';

export default class CancelToken implements ICancelToken {
  // 未取消时状态为pending，取消后状态为fulfilled
  promise: Promise<CancelError>;
  reason?: CancelError;
  _listeners?: CancelTokenPromiseResolver[];

  constructor(executor: CancelExecutor) {
    /* promise监听+发布订阅实现取消请求 */
    // 1.创建promise并暴露resolve方法
    // 技巧，在promise外使用resolve或reject改变promise状态
    let CancelTokenPromiseResolver: CancelTokenPromiseResolver;
    this.promise = new Promise(resolve => {
      CancelTokenPromiseResolver = resolve as CancelTokenPromiseResolver;
    });
    // 2.监听promise状态，结合发布订阅模式
    this.promise.then(cancelError => {
      if (!this._listeners) return;
      this._listeners.forEach(listener => listener(cancelError));
      this._listeners = void 0;
    });
    // 3.创建取消请求的函数canceler
    const canceler: Canceler = (
      message: string,
      config: AxiosRequestConfig,
      request: XMLHttpRequest,
    ) => {
      this.throwIfRequested();
      this.reason = new CancelError(message, config, request);
      CancelTokenPromiseResolver(this.reason);
    };
    // 4.将取消请求的函数canceler通过executor暴露到CancelToken外面
    executor(canceler);
  }

  // 工厂函数，包装
  source() {
    let canceler!: Canceler;
    const cancelToken = new CancelToken(c => {
      canceler = c;
    });
    return {
      token: cancelToken,
      cancel: canceler,
    };
  }

  // reason代表已经取消了
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }

  subscribe(listener: CancelTokenPromiseResolver) {
    // 如果已经取消，直接执行listener，不再放入订阅队列内
    if (this.reason) {
      listener(this.reason);
    }
    if (!this._listeners) {
      this._listeners = [listener];
    } else {
      this._listeners.push(listener);
    }
  }

  unsubscribe(listener: CancelTokenPromiseResolver) {
    if (!this._listeners) return;
    const index = this._listeners.indexOf(listener);
    if (index !== -1) this._listeners.splice(index, 1);
  }
}

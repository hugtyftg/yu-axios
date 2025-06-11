import { Canceler, CancelExecutor, CancelToken as ICancelToken } from '@/types';

interface PromiseResolver {
  (reason?: string): void;
}

export default class CancelToken implements ICancelToken {
  // 未取消时状态为pending，取消后状态为fulfilled
  promise: Promise<string>;
  reason?: string;
  constructor(executor: CancelExecutor) {
    // 技巧，在promise外使用resolve或reject改变promise状态
    let promiseResolver: PromiseResolver;
    this.promise = new Promise(resolve => {
      promiseResolver = resolve as PromiseResolver;
    });
    const canceler: Canceler = (message?: string) => {
      this.throwIfRequested();
      this.reason = message;
      promiseResolver(message);
    };
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
    if (this.reason) {
      throw new Error(this.reason);
    }
  }
}

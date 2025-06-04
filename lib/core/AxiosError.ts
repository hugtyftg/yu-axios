import {
  AxiosErrorCode,
  AxiosRequestConfig,
  AxiosResponse,
  ERROR_CODES,
  IAxiosError,
} from '@/types';

export class AxiosError extends Error implements IAxiosError {
  isAxiosError: boolean;
  // eslint-disable-next-line max-params
  constructor(
    message: string,
    public code: AxiosErrorCode,
    public config?: AxiosRequestConfig | null,
    public request?: XMLHttpRequest,
    public response?: AxiosResponse,
  ) {
    super(message);
    this.isAxiosError = true;

    // 适配不同环境
    // nodesjs环境下，使用Error.captureStackTrace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      // 浏览器环境下，使用Error.stack
      // eslint-disable-next-line unicorn/error-message
      this.stack = new Error().stack;
    }

    // 当使用 ES6 class 继承 Error 时，在 Babel 转译或某些 JavaScript 引擎中，子类实例可能无法正确继承 Error 的原型方法（如 stack 属性），导致 instanceof 检查失效
    // 因此继承内置 Error 类时，需要使用 Object.setPrototypeOf修复原型链继承
    Object.setPrototypeOf(this, AxiosError.prototype);
  }

  toJSON(): any {
    return {
      message: this.message,
      code: this.code,
      // TODO
      config: this.config,
      request: this.request,
      response: this.response,
      isAxiosError: this.isAxiosError,
    };
  }
}

// 批量定义静态属性，并且使用 Object.defineProperties 创建的属性默认是只读的（writable: false）
const descriptors: Record<string, { value: AxiosErrorCode }> = {};
Object.keys(ERROR_CODES).forEach(code => {
  descriptors[code] = { value: code as AxiosErrorCode };
});
Object.defineProperties(AxiosError, descriptors);

// 工厂模式
// eslint-disable-next-line max-params
function createError(
  message: string,
  code: AxiosErrorCode,
  config: AxiosRequestConfig | null,
  request?: XMLHttpRequest,
  response?: AxiosResponse,
): AxiosError {
  const error = new AxiosError(message, code, config, request, response);
  return error;
}

export { createError, descriptors as ErrorCodes };

import { createError, ErrorCodes } from '@/core/AxiosError';
import settle from '@/core/settle';
import { AxiosPromise, AxiosRequestConfig, AxiosResponse, IHeader } from '@/types';

const isFetchAdapter = typeof fetch === 'function';

export default isFetchAdapter &&
  function fetchAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      // TODO
      const { method = 'GET', url, data, headers = {}, timeout, responseType } = config;

      const options: RequestInit = {
        method: method.toUpperCase(),
        headers: new Headers(headers as IHeader),
        body: data,
      };

      // 超时
      let timeoutId: NodeJS.Timeout;
      // 处理超时计时器
      if (timeout) {
        timeoutId = setTimeout(() => {
          reject(createError('timeout', ErrorCodes.ERR_NETWORK.value, config, null));
        }, timeout);
      }
      fetch(url!, options)
        .then(async responseHeader => {
          clearTimeout(timeoutId);
          let responseData: any;
          switch (responseType) {
            case 'json':
              responseData = await responseHeader.json();
              break;
            case 'text':
              responseData = await responseHeader.text();
              break;
            case 'blob':
              responseData = await responseHeader.blob();
              break;
            case 'arraybuffer':
              responseData = await responseHeader.arrayBuffer();
              break;
            default:
              responseData = responseHeader.text();
              break;
          }
          const response: AxiosResponse = {
            status: responseHeader.status,
            statusText: responseHeader.statusText,
            data: responseData,
            headers: responseHeader.headers,
            config,
            request: null,
          };

          // 根据相应状态决定是否reject
          settle(resolve, reject, response);
        })
        .catch(error => {
          // 处理超时计时器
          if (timeout) {
            clearTimeout(timeoutId);
          }
          // 处理错误
          // 处理错误类型
          if (error.name === 'AbortError') {
            if (timeout) {
              reject(
                createError(
                  `Timeout of ${timeout} ms exceeded`,
                  ErrorCodes.ECONNABORTED.value,
                  config,
                ),
              );
            } else {
              reject(createError('Request aborted', ErrorCodes.ERR_CANCELED.value, config));
            }
          } else {
            reject(createError('Network Error', ErrorCodes.ERR_NETWORK.value, config));
          }
        });
    });
  };

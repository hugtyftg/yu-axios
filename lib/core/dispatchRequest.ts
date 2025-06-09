import type { AxiosRequestConfig, AxiosResponse } from '@/types';
import { flattenHeaders } from '@/helpers/headers';
import { transformUrl } from '@/helpers/url';
import { createError, ErrorCodes } from './AxiosError';

export function dispatchRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
  processConfig(config);
  return xhr(config);
}

// 对url、headers、data预处理
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config);
  config.headers = flattenHeaders(config, config.method);
}

function xhr(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const { method = 'GET', url, data, headers = {} } = config;
    const request = new XMLHttpRequest();

    request.open(method.toUpperCase(), url!, true);
    request.onreadystatechange = function () {
      // xhr.readyState 所有状态
      // UNSENT = 0; // 初始状态
      // OPENED = 1; // open 被调用
      // HEADERS_RECEIVED = 2; // 接收到 response header
      // LOADING = 3; // 响应正在被加载（接收到一个数据包）
      // DONE = 4; // 请求完成

      if (!request.readyState) return;
      if (request.readyState !== 4) return;

      // 服务器响应后，xhr的status、statusText、response属性都有值了
      const response: AxiosResponse = {
        status: request.status, // HTTP 状态码（一个数字）：200，404，403 等，如果出现非 HTTP 错误，则为 0。
        statusText: request.statusText, // HTTP 状态消息（一个字符串）：状态码为 200 对应于 OK，404 对应于 Not Found，403 对应于 Forbidden。
        data: request.response, // 服务器 response body。
        headers,
        config,
        request,
      };
      // response实际处理逻辑
      settle(resolve, reject, response);
    };

    request.onerror = function () {
      // reject(new Error('Network Error'));
      reject(
        createError(
          'Network Error',
          ErrorCodes.ERR_NETWORK.value,
          config,
          request,
          request.response,
        ),
      );
    };

    request.send(data ?? {});
  });
}

function settle(
  resolve: (value: any) => void,
  reject: (value: any) => void,
  response: AxiosResponse,
): void {
  const validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    // reject(new Error(`Request failed with status code ${response.status}`));
    reject(
      createError(
        `Request failed with status code ${response.status}`,
        // 4xx 或 5xx 错误码时，抛出的错误类型为 AxiosError.ERR_BAD_REQUEST 或 AxiosError.ERR_BAD_RESPONSE
        [ErrorCodes.ERR_BAD_REQUEST.value, ErrorCodes.ERR_BAD_RESPONSE.value][
          Math.floor(response.status / 100) - 4
        ],
        response.config,
        response.request,
        response,
      ),
    );
  }
}

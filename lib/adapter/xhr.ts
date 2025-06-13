import { createError, ErrorCodes } from '@/core/AxiosError';
import settle from '@/core/settle';
import cookie from '@/helpers/cookie';
import { parseRawResponseHeaders } from '@/helpers/headers';
import { isFormData } from '@/helpers/is';
import { isSameOrigin } from '@/helpers/url';
import { AxiosPromise, AxiosRequestConfig, AxiosResponse, CancelError } from '@/types';

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

export default isXHRAdapterSupported &&
  function xhrAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
      const {
        method = 'GET',
        url,
        data,
        headers = {},
        timeout,
        responseType,
        cancelToken,
        signal,
        withCredentials,
        xsrfHeaderName,
        xsrfCookieName,
      } = config;
      const request = new XMLHttpRequest();
      // ---------------- add event start ----------------
      const onCancel = (reason?: CancelError) => {
        request.abort();
        reject(reason);
      };
      // 接收到response之后，无论成功还是失败，都要取消订阅的onCancel函数
      const unsubscribeAfterResponse = () => {
        if (cancelToken) cancelToken.unsubscribe(onCancel);
        if (signal) signal.removeEventListener('abort', onCancel);
      };

      request.open(method.toUpperCase(), url!, true);

      request.onreadystatechange = function () {
        /**
         * xhr.readyState 所有状态
         * UNSENT = 0; // 初始状态
         * OPENED = 1; // open 被调用
         * HEADERS_RECEIVED = 2; // 接收到 response header
         * LOADING = 3; // 响应正在被加载（接收到一个数据包）
         * DONE = 4; // 请求完成
         */

        if (!request.readyState) return;
        if (request.readyState !== 4) return;

        // 服务器响应后，xhr的status、statusText、response属性都有值了
        const rawResponseHeaders = request.getAllResponseHeaders();
        const responseHeaders = parseRawResponseHeaders(rawResponseHeaders);

        const response: AxiosResponse = {
          status: request.status, // HTTP 状态码（一个数字）：200，404，403 等，如果出现非 HTTP 错误，则为 0。
          statusText: request.statusText, // HTTP 状态消息（一个字符串）：状态码为 200 对应于 OK，404 对应于 Not Found，403 对应于 Forbidden。
          data: request.response, // 服务器 response body。
          headers: responseHeaders,
          config,
          request,
        };

        // 因为resolve和reject都是接受一个参数的函数，所以这里用箭头函数
        settle(
          (val: any) => {
            resolve(val);
            unsubscribeAfterResponse();
          },
          (err: any) => {
            reject(err);
            unsubscribeAfterResponse();
          },
          response,
        );
      };
      request.onerror = function () {
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
      request.ontimeout = function () {
        reject(
          createError(
            `Timeout of ${config.timeout} ms exceeded`,
            ErrorCodes.ERR_NETWORK.value,
            config,
            request,
            request.response,
          ),
        );
      };
      // ---------------- add event end ----------------

      // ---------------- config request start ----------------
      // timeout属性设置超时时间，如果在给定时间内请求没有成功执行，请求就会被取消，并且触发 timeout 事件。
      if (timeout) {
        request.timeout = timeout;
      }
      // responseType 属性设置响应格式
      if (responseType) {
        request.responseType = responseType;
      }
      if (withCredentials) {
        request.withCredentials = withCredentials;
      }
      // ---------------- config request end ----------------

      // ---------------- config cancel start ----------------
      // 监听cancelToken.promise是否被resolve，也就是外部是否要求取消请求
      if (cancelToken || signal) {
        if (cancelToken) cancelToken.subscribe(onCancel);
        if (signal) signal.aborted ? onCancel() : signal.addEventListener('abort', onCancel);
      }
      // ---------------- config cancel end ----------------

      // ---------------- set header start ----------------
      if (isFormData(data)) {
        headers && delete headers['Content-Type'];
      }
      if (withCredentials && !isSameOrigin(url!) && xsrfHeaderName) {
        // TODO:xsrf防护
        const xsrfValue = cookie.read(xsrfCookieName!);
        xsrfValue && (headers![xsrfHeaderName!] = xsrfValue);
      }
      if (headers) {
        Object.keys(headers).forEach(key => {
          if (!data && key.toLowerCase() === 'content-type') {
            delete headers[key];
          } else {
            request.setRequestHeader(key, headers[key]);
          }
        });
      }
      // ---------------- set header start ----------------

      request.send(data as any);
    });
  };

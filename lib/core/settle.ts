import { AxiosResponse } from '@/types';
import { createError, ErrorCodes } from './AxiosError';

export default function settle(
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

import { AxiosError, ErrorCodes } from '@/core/AxiosError';
import { AxiosRequestConfig, CancelError as ICancelError } from '@/types';

export default class CancelError extends AxiosError implements ICancelError {
  __CANCEL__: boolean;
  constructor(message: string | undefined, config: AxiosRequestConfig, request: XMLHttpRequest) {
    super(message ?? 'Cancel', ErrorCodes.ERR_CANCELED.value, config, request);
    this.__CANCEL__ = true;
  }
}

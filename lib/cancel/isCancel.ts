import CancelError from './CancelError';

// 判断某个Error是否为CancelError
export default function isCancel(thing: unknown): thing is CancelError {
  return thing instanceof CancelError && thing.__CANCEL__ === true;
}

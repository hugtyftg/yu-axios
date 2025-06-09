import { IHeader, Method } from '@/types';
import { deepMerge } from '.';

export function flattenHeaders(
  headers: IHeader | null | undefined,
  method: Method,
): IHeader | null | undefined {
  if (!headers) {
    return headers;
  }
  // 1.打平 headers，优先级从低到高
  // TODO验证优先级
  headers = deepMerge(headers.common, headers[method], headers);
  // 2. 清理冗余属性
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];
  methodsToDelete.forEach(method => {
    delete headers![method];
  });
  return headers;
}

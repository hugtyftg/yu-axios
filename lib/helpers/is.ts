// 判断是否为某个类型
const isTypeof = (type: string) => (thing: any) => typeof thing === type;

export const isUndefined = isTypeof('undefined');
export const isString = isTypeof('string');
export const isNumber = isTypeof('number');
export const isBoolean = isTypeof('boolean');
export const isSymbol = isTypeof('symbol');
export const isFunction = isTypeof('function');

export function isObject<T = any>(thing: T): thing is T {
  return thing !== null && typeof thing === 'object';
}

export function isArray<T = any>(thing: T[]): thing is T[] {
  return Array.isArray(thing);
}

export function isNil(thing: any): boolean {
  return thing === null || thing === undefined;
}

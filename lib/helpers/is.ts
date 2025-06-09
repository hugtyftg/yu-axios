import { getPrototypeOf, kindOf } from './index';

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
  // 等价于thing == null
  return thing === null || thing === undefined;
}

export function isPlainObject<T = any>(thing: T): thing is T {
  // 第一步：类型过滤，排除非对象类型
  if (kindOf(thing) !== 'object') {
    return false;
  }
  // 第二步：原型链检查
  const prototype = getPrototypeOf(thing);
  return (
    // 情况1：通过 Object.create(null) 创建的无原型对象
    prototype === null ||
    // 情况2：普通对象字面量 {} 或 new Object()
    prototype === Object.prototype ||
    // 情况3：特殊无原型对象，需同时满足两个条件：toStringTag没被改写、不可迭代
    (getPrototypeOf(prototype) === null &&
      !(Symbol.toStringTag in (thing as object)) &&
      !(Symbol.iterator in (thing as object)))
  );
}

export function isDate(thing: any): thing is Date {
  return Object.prototype.toString.call(thing) === '[object Date]';
}

export function isURLSearchParams(thing: any): thing is URLSearchParams {
  return (
    Object.prototype.toString.call(thing) === '[object URLSearchParams]' ||
    thing instanceof URLSearchParams
  );
}

export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
}

// 判断是否为某个类型
const isTypeof = (type: string) => (thing: any) => typeof thing === type;

export const isUndefined = isTypeof('undefined');
export const isString = isTypeof('string');
export const isNumber = isTypeof('number');
export const isBoolean = isTypeof('boolean');
export const isSymbol = isTypeof('symbol');
export const isFunction = isTypeof('function');

export const isObject = <T = any>(thing: T): thing is T =>
  thing !== null && typeof thing === 'object';

export const isArray = <T = any>(thing: T[]): thing is T[] =>
  Array.isArray(thing);

export const isNil = (thing: any) => thing === null || thing === undefined;

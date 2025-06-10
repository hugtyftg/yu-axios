import { isPlainObject } from './is';

const { toString } = Object.prototype;

// 利用IIFE创建一个没有任何原型链继承的对象，用来缓存每个类型的字符串表示
export const kindOf = ((cache: any) => (thing: unknown) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

// 将fn的this绑定到thisArg上
function _bind(fn: Function, thisArg: unknown) {
  return function (...args: any) {
    return fn.apply(thisArg, args);
  };
}

// 将from的属性拷贝到to上
export function extend<T, U>(to: T, from: U, thisArg?: unknown): T & U {
  for (const key in from) {
    if (thisArg && typeof from[key] === 'function') {
      (to as any)[key] = _bind(from[key], thisArg);
    } else {
      (to as any)[key] = from[key];
    }
  }
  return to as T & U;
}

// 将多个plain object或者原始值合并成一个plain object，不考虑array的合并
export function deepMerge(...params: any): any {
  const result = Object.create(null);

  const assignValue = (value: any, key: string): any => {
    if (isPlainObject(result[key]) && isPlainObject(value)) {
      // 二者都为对象时，递归合并
      result[key] = deepMerge(result[key], value);
    } else if (isPlainObject(value)) {
      // value是对象，result[key]不是对象，为了保证value的原型链 继承干净，需要重新创建一个对象
      result[key] = deepMerge({}, value);
    } else {
      // value不是对象，无论result[key]是什么，都直接赋值
      result[key] = value;
    }
  };

  // 遍历处理每个参数的每个属性
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    for (const key in param) {
      assignValue(param[key], key);
    }
  }

  return result;
}

const { getPrototypeOf } = Object;

export { getPrototypeOf, isPlainObject };

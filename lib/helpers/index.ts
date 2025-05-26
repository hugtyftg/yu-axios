import { isObject } from './is';

// 将多个plain object或者原始值合并成一个plain object，不考虑array的合并
export function deepMerge(...params: any) {
  let result = Object.create(null);

  const assignValue = (value: any, key: string) => {
    if (isObject(result[key]) && isObject(value)) {
      // 二者都为对象时，递归合并
      result[key] = deepMerge(result[key], value);
    } else if (isObject(value)) {
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

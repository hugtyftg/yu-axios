import { deepMerge, isObject } from '@/helpers';
import { isNil } from '@/helpers/is';
import { AxiosRequestConfig } from '@/types';

/**
 * 策略模式，根据不同的情况选择不同的参数合并策略，最后得到一个map，作为各种情形与策略的映射
 */
type StrategyFn = (val1: unknown, val2: unknown) => any;

const defaultStrategy: StrategyFn = (val1: unknown, val2: unknown) => {
  return val2 ?? val1;
};

const fromVal2Strategy: StrategyFn = (_val1: unknown, val2: unknown) => {
  return val2;
};

const deepMergeStrategy: StrategyFn = (val1: unknown, val2: unknown) => {
  // 如果val2是对象，就进行深度合并
  if (isObject(val2)) {
    return deepMerge(val1, val2);
  }
  // 如果val2是除了undefined、null之外的primitive value，就直接返回val2
  if (!isNil(val2)) {
    return val2;
  }
  // 如果val2是undefined、null，就只能根据val1，再次执行上面的逻辑
  if (isObject(val1)) {
    return deepMerge(val1);
  }
  if (!isNil(val1)) {
    return val1;
  }
  // 如果val1、val2都是undefined、null，就抛出错误
  throw new Error('未传入参数');
};

const strategyMap: Map<string, StrategyFn> = new Map([
  ['url', fromVal2Strategy],
  ['data', fromVal2Strategy],
  ['header', deepMergeStrategy],
  ['auth', deepMergeStrategy],
]);

// 将两个config对象合并
function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig,
): AxiosRequestConfig {
  if (!config2) {
    config2 = {};
  }
  const result = Object.create(null);
  // 将两个对象的某个key值合并
  function mergeField(key: string): any {
    const strat = strategyMap.get(key) ?? defaultStrategy;
    result[key] = strat(config1[key], (config2 as AxiosRequestConfig)[key]);
  }
  // 以config2为基准
  for (const key in config2) {
    mergeField(key);
  }
  // 处理config2没有、config1有的key
  for (const key in config1) {
    if (!(key in config2)) {
      mergeField(key);
    }
  }
  return result;
}

export default mergeConfig;

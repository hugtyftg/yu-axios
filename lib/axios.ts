import type { AxiosInstance, AxiosRequestConfig, AxiosStatic, CancelTokenStatic } from './types';
import CancelToken from './cancel/CancelToken';
import { Axios } from './core/Axios';
import { defaultConfig as defaults } from './core/defaults';
import mergeConfig from './core/mergeConfig';
import { extend } from './helpers';
// 工厂模式
function createInstance(config: AxiosRequestConfig) {
  // 1. 创建 Axios 类实例（承载配置和核心逻辑）
  const context = new Axios(config);

  // 2. 创建基础请求函数（本质是调用 Axios.prototype.request）
  const instance = Axios.prototype.request.bind(context);

  // 3. 混合继承：将 Axios 原型方法（get/post等）复制到请求函数
  extend(instance, Axios.prototype, context); // 保持方法上下文

  // 4. 混合继承：将 Axios 实例属性（defaults等）复制到请求函数
  extend(instance, context);

  // 🌟最终返回的对象同时具备：
  // - 函数特性：可以直接调用 instance(config)
  // - 对象特性：拥有 instance.get()/instance.post() 等方法
  return instance as AxiosInstance;
}

// 门面模式：通过一个统一的接口，隐藏子系统的复杂性，为客户端提供更简洁、易用的访问方式
// Axios 通过一个顶层对象 axios 暴露所有核心功能（如 .get()、.post()、.create() 等），
// 但这个对象本身并不直接实现请求逻辑，而是将具体工作委托给内部模块（如 Axios 类、拦截器、适配器等）。
const axios = createInstance(defaults) as AxiosStatic;

/* axios实例上额外挂载的方法 */
axios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config));
};

axios.all = function all(promises) {
  return Promise.all(promises);
};

// 作用：将数组结构的响应结果展开为独立参数，解决 Promise.all 返回数组需要手动解构的问题
axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback(...arr);
  };
};

/* // 并发请求
const promise1 = axios.get('/user/123');
const promise2 = axios.get('/orders');

// 不使用 spread
axios.all([promise1, promise2]).then(([userRes, ordersRes]) => {
  console.log(userRes.data, ordersRes.data);
});

// 使用 spread 更优雅
axios.all([promise1, promise2]).then(
  axios.spread((userRes, ordersRes) => {
    console.log(userRes.data, ordersRes.data);
  }),
); */

axios.Axios = Axios;

axios.CancelToken = CancelToken as CancelTokenStatic;

export default axios;

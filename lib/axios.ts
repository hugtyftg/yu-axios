import type { AxiosInstance, AxiosRequestConfig } from './types';
import { Axios } from './core/Axios';
import { defaultConfig as defaults } from './core/defaults';
// 工厂模式
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config);

  return context as AxiosInstance;
}

// 门面模式：通过一个统一的接口，隐藏子系统的复杂性，为客户端提供更简洁、易用的访问方式
// Axios 通过一个顶层对象 axios 暴露所有核心功能（如 .get()、.post()、.create() 等），
// 但这个对象本身并不直接实现请求逻辑，而是将具体工作委托给内部模块（如 Axios 类、拦截器、适配器等）。
const axios = createInstance(defaults);

export default axios;

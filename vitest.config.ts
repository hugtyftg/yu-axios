/// <reference types="vitest" />
// 类型声明（三斜线指令），告诉 TypeScript 编译器在编译时使用 Vitest 的类型定义，使配置中的 test 字段和其他 Vitest API 获得类型提示

import path from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // 别名配置，ts、vite、vitest都要同步配置
    alias: {
      '@': path.resolve(__dirname, 'lib'),
    },
  },
  test: {
    // 将 Vitest 的 API（如 describe、test、expect）注入为全局变量，无需手动导入
    globals: true,
    // 指定测试运行时环境为 jsdom，模拟浏览器 DOM 环境
    environment: 'jsdom',
    // 限制覆盖率统计范围，只分析 lib 目录内的文件
    coverage: {
      include: ['lib'],
    },
  },
});

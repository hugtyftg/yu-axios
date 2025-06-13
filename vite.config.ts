import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // Vite的Library模式下运行时，能够自动生成类型声明文件(*.d.ts)
    dts(),
  ],
  // 配置打包信息
  build: {
    // 库模式 https://cn.vitejs.dev/guide/build#library-mode
    lib: {
      // 打包入口文件
      entry: './lib/index.ts',
      // UMD模式下本库会作为cdn从script中引入，此时本库暴露给window的全局变量名称
      name: 'yu-axios',
      // 打包输出的包文件名，默认package.json的name选项
      fileName: 'yu-axios',
    },
  },
  resolve: {
    // 别名配置，ts、vite、vitest都要同步配置
    alias: {
      '@': path.resolve(__dirname, 'lib'),
    },
  },
});

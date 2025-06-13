import path from 'node:path';
// 可视化打包内容
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // Vite的Library模式下运行时，能够自动生成类型声明文件(*.d.ts)
    dts(),
    visualizer({ open: true }),
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
      // 默认的 formats 为 ['es'、'umd']，如果使用多个入口，则为 ['es'、'cjs']
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        // 同时使用 默认导出（default export）和 具名导出（named exports），默认导出优先
        exports: 'named',
      },
    },
    // Terser 在默认配置下可能会保留注释或 source map，导致输出文件体积增大。
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除所有 console 调用
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
      },
      format: {
        // 不保留版权注释
        comments: false,
      },
      // 不生成 source map
      sourceMap: false,
    },
  },
  resolve: {
    // 别名配置，ts、vite、vitest都要同步配置
    alias: {
      '@': path.resolve(__dirname, 'lib'),
    },
  },
});

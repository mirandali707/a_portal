// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        single: resolve(__dirname, 'pages/single_sketch.html'),
        multi: resolve(__dirname, 'pages/multi_sketch.html')
      }
    }
  }
})
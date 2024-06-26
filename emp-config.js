const { defineConfig } = require('@efox/emp');
module.exports = defineConfig(() => {
  return {
    build: {
      lib: {
        entry: 'index.ts',
        formats: ['commonjs'],
        fileName: 'index.js',
        external: {
          axios: 'axios',
          commander: 'commander',
          cors: 'cors',
          'body-parser': 'body-parser',
          express: 'express',
          lodash: 'lodash',
          fs: 'fs',
          os: 'os',
          path: 'path',
          util: 'util',
          vm: 'vm',
          crypto: 'crypto',
          multer: 'multer',
          'form-data': 'form-data',
        }
      }
    },
  }
});
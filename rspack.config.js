module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'commonjs/index.js',
        library: {
            name: 'MockServerJs',
            type: 'commonjs',
        },
    },
    devtool: false,
    externals: {
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
    },
};
const path = require('path');
const mockFileRootDir = '__mock__';

module.exports = {
    timeout: 300, // 延迟
    model: 'local', // 强制使用本地（local）或者远程代理模式（remote）默认 auto
    print_req: true,
    fileWithEnd: '.js', // mock 的文件 目前只兼容 js
    mockSrc: mockFileRootDir, // 读取mock的目录
    /**
    * @desc 启动命令时候添加配置 --scan 可以启动扫描线上接口生成到本地
    * @example 
    * enhances-mock start --scan true 
    */
    scan: {
        /**
         * @desc 最终输出的路径
         * @param {string} path 扫描的路径
         * @returns {string} 最终的输出路径
         * @default __mock__/.remotes/{扫描的路径}
         */
        outputChunk: function (url) {
            return path.join(mockFileRootDir, '.remotes', url);
        },
        /**
         * @desc 输出的文件格式 '.json' | '.js'
         * @default js
         */
        format: '.js',
    },
    logDir: mockFileRootDir, // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
    logReplaceMaxSize: 1024 * 1024, // 日志最大的覆盖内容大小， 大于这个大小(Bytes)内容将会被覆盖

    /**
     * @param {[string]|[{ suffix: string; dir: string }]} staticServic
     */
    staticServic: ['public'], // 在cwd下开放为静态服务目录
    proxyURL: {
        origin: 'http://192.168.0.151:8888/api/v1',
        async format(api) {
            return this._url.origin + api;
        }
    },
    get cwd() {
        return path.resolve(process.cwd());
    },
    formatHeaders(headers) {
        delete headers.host
        return {
            ...headers,
            'content-length': 0,
        };
    },
    interceptors: {
        request(req) {
            return req;
        },
        response(data) {
            return data;
        }
    }
}

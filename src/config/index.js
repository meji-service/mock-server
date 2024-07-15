const path = require('path');
/**
 * @param {[string]|[{ suffix: string; dir: string }]} staticServic
 */
module.exports = {
    timeout: 0, // 延迟
    model: 'local', // 强制使用本地（local）或者远程代理模式（remote）默认 auto
    print_req: true,
    fileWithEnd: '.js', // mock 的文件
    mockSrc: '__mock__', // 读取mock的目录
    logDir: '__mock__', // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
    logReplaceMaxSize: 1024 * 1024, // 日志最大的覆盖内容大小， 大于这个大小(Bytes)内容将会被覆盖
    staticServic: ['public'], // 在cwd下开放为静态服务目录
    // proxyURL(url) {
    //     // 自定义代理的服务
    //     return 'http://113.108.106.175:81' + url;
    // },
    proxyURL: {
        origin: 'https://rpapi.cppinfo.cn',
        async format(api) {
            return this._url.origin + api;
        }
    },
    get cwd() {
        return path.resolve(process.cwd());
    },
    formatHeaders(headers) {
        delete headers.host
        return headers;
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

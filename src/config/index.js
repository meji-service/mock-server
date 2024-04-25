const path = require('path');
/**
 * @param {[string]|[{ suffix: string; dir: string }]} staticServic
 */
module.exports = {
    timeout: 0, // 延迟
    print_req: true, 
    fileWithEnd: '.js', // mock 的文件
    mockSrc: '__mock__', // 读取mock的目录
    logDir: '__mock__', // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
    staticServic: ['public'], // 在cwd下开放为静态服务目录
    proxyURL(url) {
        // 自定义代理的服务
        return 'http://113.108.106.175:81' + url;
    },
    get cwd() {
        return path.resolve(process.cwd());
    },
}

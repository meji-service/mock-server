const path = require('node:path');

module.exports = {
    timeout: 0,
    fileWithEnd: '.js',
    mockSrc: '__mock__',
    logDir: '__mock__',
    logFileName: 'log',
    proxyURL(url) {
        // 自定义代理的服务
        return 'http://113.108.106.175:81' + url;
    },
    get cwd() {
        return path.resolve(process.cwd());
    },
}

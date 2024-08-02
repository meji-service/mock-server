const path = require('path');
const memoize = require('lodash/memoize');
const defaultOption = require('../../config');
const configFileName = require('../../config/const').configFileName;
const lodashMerge = require('lodash/merge');
const { readJsFileToObject } = require('@mock-server/utils/os');

function useProxyOptions(mcokConfigExports) {
    const { proxyURL, } = mcokConfigExports;
    // 不是对象配置 return
    if (typeof proxyURL === 'function' || !proxyURL?.origin) return mcokConfigExports;
    const _url = new URL(proxyURL.origin);
    mcokConfigExports.proxyURL.host = proxyURL.host ?? _url.host;
    mcokConfigExports.proxyURL._url = _url;
    return mcokConfigExports;
}

exports.getOptions = memoize(function () {
    const configFilePath = path.resolve(defaultOption.cwd, configFileName);
    const config = readJsFileToObject(configFilePath) ?? {};
    return useProxyOptions(lodashMerge({}, defaultOption, config ?? {}));
});
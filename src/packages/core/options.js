const path = require('path');
const defaultOption = require('../../config');
const configFileName = require('../../config/const').configFileName;
const lodashMerge = require('lodash/merge');
const { readJsFileToObject } = require('@mock-server/utils/os');
const cloneDeep = require('lodash/cloneDeep');

function useProxyOptions(mcokConfigExports) {
    const { proxyURL, } = mcokConfigExports;
    // 不是对象配置 return
    if (typeof proxyURL === 'function' || !proxyURL?.origin) return mcokConfigExports;
    const _url = new URL(proxyURL.origin);
    mcokConfigExports.proxyURL.host = proxyURL.host ?? _url.host;
    mcokConfigExports.proxyURL._url = _url;
    return mcokConfigExports;
}
let options = cloneDeep(defaultOption);

/**
 * 获取 mock-server 配置
 */
exports.getOptions = function () {
    return options;
};

/**
 * 设置 mock-server 配置
 */
exports.setupOptions = function () {
    const configFilePath = path.resolve(defaultOption.cwd, configFileName);
    const config = readJsFileToObject(configFilePath) ?? {};
    options = cloneDeep(useProxyOptions(lodashMerge({}, defaultOption, config ?? {})));
    return options;
}
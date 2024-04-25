const path = require('path');
const defaultOption = require('../../config');
const configFileName = require('../../config/const').configFileName;
const lodashMerge = require('lodash/merge');
const { readJsFileToObject } = require('@mock-server/utils/os');

exports.getOptions = function getOptions() {
    const configFilePath = path.resolve(defaultOption.cwd, configFileName);
    const _conext = readJsFileToObject(configFilePath) ?? defaultOption;
    return lodashMerge({}, defaultOption, _conext.module.exports);
};
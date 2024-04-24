const path = require('path');
const fs = require('fs');
const vm = require('vm');
const defaultOption = require('../../config');
const configFileName = require('../../config/const').configFileName;
const lodashMerge = require('lodash/merge');
const context = vm.createContext({
    exports: {},
    module: {
        exports: {}
    }
}); // 创建一个空的上下文对象
exports.getOptions = function getOptions() {
    try {
        const configFilePath = path.resolve(defaultOption.cwd, configFileName);
        const config = fs.readFileSync(configFilePath, { encoding: 'utf8' });
        vm.runInContext(config, context);
        return lodashMerge({}, defaultOption, context.module.exports)
    } catch {
    }
    return defaultOption;
};
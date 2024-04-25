const fs = require('fs');
const vm = require('vm');

// 创建一个空的上下文对象
const customContext = vm.createContext({
    exports: {},
    module: {
        exports: {}
    }
});

/**
 * 
 * @param {*} configFilePath 
 * @returns {customContext}
 */
exports.readJsFileToObject = function (configFilePath) {
    try {
        const config = fs.readFileSync(configFilePath, { encoding: 'utf8' });
        vm.runInContext(config, customContext);
        return customContext;
    } catch {

    }
}
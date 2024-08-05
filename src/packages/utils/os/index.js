const path = require('path');
const configFileName = require('../../../config/const').configFileName;

/**
 * 
 * @param {*} configFilePath 
 * @returns {customContext|undefined}
 */
exports.readJsFileToObject = function (configFilePath) {
    try {
        const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        requireFunc.cache[configFilePath] && delete requireFunc.cache[configFilePath];
        const mockConfig = requireFunc(path.resolve(configFilePath));
        return mockConfig;
    } catch(err) {
        if(configFilePath.endsWith(configFileName)) {
            console.log(`No ${configFileName} found in ${path.resolve(configFilePath)}`);
            return undefined;
        }
        console.log(err.message?.split?.("\n")?.[0] || err.message);
    }

}
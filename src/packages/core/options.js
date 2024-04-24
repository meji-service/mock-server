const path = require('node:path');
const defaultOption = require('../../config');
const configFileName = require('../../config/const').configFileName;
const lodashMerge = require('lodash/merge');

module.exports = (() => {
    try {
        const config = require(path.resolve(defaultOption.cwd, configFileName));
        return lodashMerge({}, defaultOption, config)
    } catch { }
    return defaultOption;
})();
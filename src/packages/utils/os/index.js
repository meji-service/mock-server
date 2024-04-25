const fs = require('fs');
const vm = require('vm');
const { mockUtil } = require('@mock-server/share')

/**
 * 
 * @param {*} configFilePath 
 * @returns {customContext|undefined}
 */
exports.readJsFileToObject = function (configFilePath) {
    try {
        const _exports = {
            mockUtil: new mockUtil(),
        }
        const _context = vm.createContext({
            exports: _exports,
            module: {
                exports: _exports,
            }
        });
        const _code = fs.readFileSync(configFilePath, { encoding: 'utf8' });
        vm.runInContext(_code, _context);
        return {
            _context,
            _code,
        };
    } catch {}
}
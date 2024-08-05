
const fs = require('fs');
const path = require('path');

function useMockServerJs(op) {
    if(op.env === 'dev') {
        return require(`../src/packages/index.js`);
    }
    return require(`../dist/commonjs/index.js`).MockServerJs;
}

exports.exec = function (op) {
    const MockServerJs = useMockServerJs(op);
    if (!MockServerJs) return;
    MockServerJs.core.main();
    fs.watchFile(path.join(MockServerJs.core.getOptions().cwd, MockServerJs.core.configFileName), function () {
        MockServerJs.core.setupOptions();
        MockServerJs.utils.printInColor([{ color: 'green', text: 'Mock server config file changed update options end' }]);
    });
}

exports.jsonToJs = function (op) {
    const MockServerJs = useMockServerJs(op);
    if (!MockServerJs) return;
    MockServerJs.utils.jsonToJs(op.come, op.output);
}

exports.jsToJson = function (op) {
    const MockServerJs = useMockServerJs(op);
    if (!MockServerJs) return;
    MockServerJs.utils.jsToJson(op.come, op.output);
}
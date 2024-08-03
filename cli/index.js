const { MockServerJs } = require('../dist/commonjs/index.js');
const fs = require('fs');
const path = require('path');

exports.exec = function exec() {
    MockServerJs && MockServerJs.main();
    fs.watchFile(path.join(MockServerJs.getOptions().cwd, MockServerJs.configFileName), function () {
        MockServerJs.setupOptions();
        MockServerJs.utils.printInColor([{ color: 'green', text: 'Mock server config file changed update options end' } ]);
    });
}
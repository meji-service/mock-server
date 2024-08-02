const { MockServerJs } = require('../dist/commonjs/index.js');

exports.exec = function exec() {
    MockServerJs && MockServerJs.main();
}
const child_process = require('node:child_process');
const path = require('node:path');

exports.exec = function exec({ port = 60363, env } = {}) {
    const filePathName = env === 'prod' ? '../dist/commonjs/index.js' : '../src/packages/index.js';
    const execFile = path.resolve(__dirname, filePathName);
    this.process = child_process.exec(`node ${execFile} -p ${port}`);
    // 捕获标准输出并打印
    this.process.stdout.on('data', (data) => {
        console.log(data);
    });

    // 捕获标准错误并打印
    this.process.stderr.on('data', (data) => {
        console.error(data);
    });

    // 子进程关闭时的处理
    this.process.on('close', (code) => {
        console.log(code);
    });

}
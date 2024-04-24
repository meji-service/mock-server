const child_process = require('node:child_process');

exports.exec = function exec({ port = 60363 } = {}) {
    this.process = child_process.exec(`node ../src/packages/index.js -p ${port}`);
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
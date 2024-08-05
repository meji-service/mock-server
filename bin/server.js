#! /usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
program.version(pkg.version, '-v, --version').usage('<command> [options]');
const {
    exec,
    jsonToJs,
    jsToJson,
} = require('../cli');

program
    .command('start')
    .description('启动')
    .option('-p, --port <port>', '设置服务器端口', 60363)
    .option('-e, --env <env>', '设置环境', 'prod')
    .option('-s, --scan <scan>', '扫描线上接口到本地', false)
    .action(exec);

const comeExpress = ['-c, --come <come>', '来源目录'];
const outputExpress = ['-o, --output <output>', '输出目录'];
program
    .command('jsonToJs')
    .description('开始执行json转换为js')
    .option(...comeExpress)
    .option(...outputExpress)
    .action(jsonToJs);
program
    .command('jsToJson')
    .description('开始执行json转换为js')
    .option(...comeExpress)
    .option(...outputExpress)
    .action(jsToJson);

// 执行命令
program.parse(process.argv);

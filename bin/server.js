#! /usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');
program.version(pkg.version, '-v, --version').usage('<command> [options]');
const { exec } = require('../cli/start');

program.command('start')
    .description('启动')
    .option('-p, --port <port>', '设置服务器端口', 60363)
    .option('-e, --env <env>', '设置环境', 'prod')
    .action(async o => {
        exec(o, pkg);
    });

// 执行命令
program.parse(process.argv)
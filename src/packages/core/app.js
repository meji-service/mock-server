const { printInColor, getLocalIP } = require('@mock-server/utils');
const { program } = require('commander');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

program
    .option('-p, --port <port>', '设置服务器端口', 60363)
    .parse(process.argv)

function printRunTarget(ip) {
    printInColor([{
        color: 'magenta',
        text: 'Loopback: '
    },
    {
        color: 'green',
        text: `应用实例正在主机的`,
    },
    {
        color: 'cyan',
        text: ip,
    },
    {
        color: 'green',
        text: `上运行。`,
    },
    ]);
}
exports.createServerApp = function createServerApp(port = 60363) {

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    // // 配置 multer 使用内存存储
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage }).single('file'); // 将文件暂存到 'uploads/' 目录

    app.use(upload);
    const server = app.listen(program?._optionValues?.port || port, () => {
        const port = server.address().port;
        printRunTarget(` http://localhost:${port}/ `)
        printRunTarget(` http://${getLocalIP()}:${port}/ `)
    });
    return app;
}
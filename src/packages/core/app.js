const { printInColor, getLocalIP } = require('@mock-server/utils');
const { program } = require('commander');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
 
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

    const server = app.listen(program?._optionValues?.port || port, () => {
        const port = server.address().port;
        printRunTarget(` http://localhost:${port}/ `)
        printRunTarget(` http://${getLocalIP()}:${port}/ `)
    });
    return app;
}
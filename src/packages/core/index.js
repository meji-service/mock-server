const createServerApp = require('./app').createServerApp;
const createMockServer = require('./server').createMockServer;
const createStaticService = require('./static').createStaticService;
const configFileName = require('../../config/const').configFileName;
const { getOptions, setupOptions } = require('@mock-server/core/options');


function main() {
    setupOptions();
    const { app } = createServerApp();
    createStaticService(app);
    createMockServer(app);
}

function exit(...arg) {
    process.exit(...arg);
}

module.exports = {
    main,
    exit,
    configFileName,
    getOptions,
    setupOptions,
}
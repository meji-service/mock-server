const createServerApp = require('./app').createServerApp;
const createMockServer = require('./server').createMockServer;
const createStaticService = require('./static').createStaticService;
const configFileName = require('../../config/const').configFileName;
const { getOptions, setupOptions } = require('@mock-server/core/options');


async function main() {
    setupOptions();
    const { app } = createServerApp();
    await createStaticService(app);
    await createMockServer(app);
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
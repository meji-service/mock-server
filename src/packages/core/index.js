const createServerApp = require('./app').createServerApp;
const createMockServer = require('./server').createMockServer;
const createStaticService = require('./static').createStaticService;
const configFileName = require('../../config/const').configFileName;
const { getOptions, setupOptions } = require('@mock-server/core/options');
const { logger } = require('node-logger-plus');

async function main() {
    const { loggerConfig } = setupOptions();
    logger.setConfig(loggerConfig);
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
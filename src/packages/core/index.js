const createServerApp = require('./app').createServerApp;
const createMockServer = require('./server').createMockServer;
const createStaticService = require('./static').createStaticService;

exports.main = function main() {
    const app = createServerApp();
    createStaticService(app);
    createMockServer(app);
}


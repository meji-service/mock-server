const createServerApp = require('./app').createServerApp;
const createMockServer = require('./server').createMockServer;


exports.main = function main() {
    require('./options');
    createMockServer(createServerApp());
}


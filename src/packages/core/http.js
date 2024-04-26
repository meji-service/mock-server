const https = require('https');
const getOptions = require('./options').getOptions;

exports.httpsAgent = null;
exports.useHttpsAgent = function () {
    const options = getOptions();
    if (exports.httpsAgent) {
        console.log("緩存")
        return exports.httpsAgent;
    }
    if (options.https) {
        const agent = new https.Agent(options?.httpsConfig?.agent ?? {});
        exports.httpsAgent = agent;
        return agent;
    }
}   
